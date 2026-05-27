import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useParams,
} from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import VideoPlayer from './components/course.jsx'
import Navbar from './components/navbar.jsx'
import defaultCourses from './data/courses.json'

const LOCAL_STORAGE_KEY = 'gdrive-courses'
const LOCAL_COURSE_IMAGE = 'https://placehold.co/120x120?text=Local'
const HANDLE_DB_NAME = 'gdrive-courses-db'
const HANDLE_STORE = 'directory-handles'

const normalizeStoredCourses = (courses) => {
  return courses.map((course) => {
    if (!course || !course.isLocal) {
      return course
    }
    const videos = Array.isArray(course.videos) ? course.videos : []
    return {
      ...course,
      needsImport: true,
      videos: videos.map((video, index) => ({
        id: video.id ?? `${course.id}-${index}`,
        title: video.title || `Clase ${index + 1}`,
        duration: video.duration ?? null,
        relativePath: video.relativePath || null,
        sourceKey: course.sourceKey || null,
        kind: 'video',
        src: null,
        note: 'Reimporta la carpeta para reproducir este video.',
      })),
    }
  })
}

const loadStoredCourses = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      return defaultCourses
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeStoredCourses(parsed)
    }
  } catch (error) {
    console.error('Failed to read local courses', error)
  }

  return defaultCourses
}

const saveCourses = (courses) => {
  const payload = normalizeStoredCourses(courses)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
}

const openHandleDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(HANDLE_DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(HANDLE_STORE)
    }
    request.onsuccess = () => resolve(request.result)
  })

const withHandleStore = async (mode, callback) => {
  const db = await openHandleDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE, mode)
    const store = tx.objectStore(HANDLE_STORE)
    const result = callback(store)
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
  })
}

const saveDirectoryHandle = async (key, handle) => {
  await withHandleStore('readwrite', (store) => store.put(handle, key))
}

const getAllDirectoryHandles = async () => {
  return withHandleStore('readonly', (store) =>
    new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  )
}

const hasStoredCourses = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      return false
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
  } catch {
    return false
  }
}

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) {
    return null
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}m ${secs}s`
}

const getLocalVideoMeta = (file) =>
  new Promise((resolve) => {
    const src = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = src

    const done = (duration) => {
      resolve({
        src,
        duration: formatDuration(duration),
      })
    }

    video.onloadedmetadata = () => done(video.duration)
    video.onerror = () => done(0)
  })

const collectVideoFiles = async (handle, rootName, prefix = '') => {
  const entries = []

  for await (const entry of handle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile()
      if (!file.type.startsWith('video/')) {
        continue
      }
      const relativePath = `${rootName}/${prefix}${entry.name}`
      entries.push({ file, relativePath })
    } else if (entry.kind === 'directory') {
      const nextPrefix = `${prefix}${entry.name}/`
      const nested = await collectVideoFiles(entry, rootName, nextPrefix)
      entries.push(...nested)
    }
  }

  return entries
}

const buildCoursesFromFiles = async (items) => {
  const byFolder = new Map()

  items.forEach((item) => {
    const file = item.file || item
    if (!file.type || !file.type.startsWith('video/')) {
      return
    }
    const relativePath =
      item.relativePath || file.webkitRelativePath || `Local/${file.name}`
    const [folderName] = relativePath.split('/')
    if (!byFolder.has(folderName)) {
      byFolder.set(folderName, [])
    }
    byFolder.get(folderName).push({ file, relativePath })
  })

  const courses = []
  const baseId = Date.now()
  let offset = 0

  for (const [folderName, folderFiles] of byFolder.entries()) {
    const sortedFiles = [...folderFiles].sort((a, b) =>
      a.file.name.localeCompare(b.file.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    )
    const videoItems = await Promise.all(
      sortedFiles.map(async (item, index) => {
        const meta = await getLocalVideoMeta(item.file)
        const name = item.file.name.replace(/\.[^/.]+$/, '')
        return {
          id: `${baseId}-${offset}-${index}`,
          title: name,
          duration: meta.duration,
          src: meta.src,
          kind: 'video',
          relativePath: item.relativePath,
        }
      })
    )

    courses.push({
      id: `local-${baseId}-${offset}`,
      title: folderName,
      sourceKey: folderName,
      description: 'Curso local generado desde carpeta',
      instructor: 'Local',
      duration: `${videoItems.length} clases`,
      image: LOCAL_COURSE_IMAGE,
      driveUrl: '',
      isLocal: true,
      videos: videoItems,
    })
    offset += 1
  }

  return courses
}

const CourseRoute = ({ courses }) => {
  const { id } = useParams()
  const course = courses.find((item) => String(item.id) === String(id))

  if (!course) {
    return <Navigate to="/" replace />
  }

  return <VideoPlayer videos={course.videos} title={course.title} />
}

const Layout = ({ onImportFolder }) => {
  const inputRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const supportsPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window

  const handlePickFolder = async () => {
    if (supportsPicker) {
      setImporting(true)
      try {
        const handle = await window.showDirectoryPicker()
        if (onImportFolder) {
          await onImportFolder({ handle })
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Failed to import directory', error)
        }
      } finally {
        setImporting(false)
      }
      return
    }

    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const handleFilesChange = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) {
      return
    }

    setImporting(true)
    try {
      if (onImportFolder) {
        await onImportFolder({ files })
      }
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  return (
    <div className="app-shell">
      <Navbar onPickFolder={handlePickFolder} importing={importing} />
      <main className="content">
        <Outlet />
      </main>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*"
        onChange={handleFilesChange}
        webkitdirectory="true"
        directory=""
        className="hidden-input"
      />
    </div>
  )
}

const Root = () => {
  const [courses, setCourses] = useState(loadStoredCourses)

  const replaceLocalCourses = useCallback((newCourses) => {
    if (!newCourses.length) {
      return
    }
    setCourses((prevCourses) => {
      const base = hasStoredCourses() ? prevCourses : []
      const incomingKeys = new Set(newCourses.map((course) => course.sourceKey))
      const filtered = base.filter((course) => {
        if (!course.isLocal) {
          return true
        }
        return !incomingKeys.has(course.sourceKey)
      })
      const merged = [...filtered, ...newCourses]
      saveCourses(merged)
      return merged
    })
  }, [])

  const handleImportFolder = useCallback(
    async ({ files, handle }) => {
      if (handle) {
        const items = await collectVideoFiles(handle, handle.name)
        const newCourses = await buildCoursesFromFiles(items)
        if (newCourses.length) {
          await saveDirectoryHandle(handle.name, handle)
          replaceLocalCourses(newCourses)
        }
        return
      }

      if (files) {
        const items = files.map((file) => ({
          file,
          relativePath: file.webkitRelativePath || `Local/${file.name}`,
        }))
        const newCourses = await buildCoursesFromFiles(items)
        replaceLocalCourses(newCourses)
      }
    },
    [replaceLocalCourses]
  )

  useEffect(() => {
    let active = true

    const hydrateLocalCourses = async () => {
      try {
        const handles = await getAllDirectoryHandles()
        if (!handles.length) {
          return
        }
        const refreshed = []

        for (const handle of handles) {
          if (!handle) {
            continue
          }
          const permission = await handle.queryPermission({ mode: 'read' })
          if (permission !== 'granted') {
            continue
          }
          const items = await collectVideoFiles(handle, handle.name)
          const coursesFromHandle = await buildCoursesFromFiles(items)
          refreshed.push(...coursesFromHandle)
        }

        if (!active || !refreshed.length) {
          return
        }

        setCourses((prevCourses) => {
          const nonLocal = prevCourses.filter((course) => !course.isLocal)
          const merged = [...nonLocal, ...refreshed]
          saveCourses(merged)
          return merged
        })
      } catch (error) {
        console.error('Failed to restore local courses', error)
      }
    }

    hydrateLocalCourses()

    return () => {
      active = false
    }
  }, [])

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: <Layout onImportFolder={handleImportFolder} />,
          children: [
            { path: '/', element: <App courses={courses} /> },
            { path: '/courses', element: <App courses={courses} /> },
            { path: '/courses/:id', element: <CourseRoute courses={courses} /> },
          ],
        },
      ]),
    [courses, handleImportFolder]
  )

  return <RouterProvider router={router} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
