import { useState, useCallback, useRef, useEffect } from 'react'

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

interface UseCameraReturn {
  startCamera: (facingMode?: 'user' | 'environment') => Promise<MediaStream | null>
  stopCamera: () => void
  capturePhoto: (videoElement: HTMLVideoElement) => string | null
  isSupported: boolean | null // null = still checking
  permissionState: PermissionState
  error: Error | null
  stream: MediaStream | null
}

/**
 * Hook for managing camera access and photo capture
 * The component is responsible for managing the video element
 */
export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt')
  const [error, setError] = useState<Error | null>(null)
  // null = still checking, true = supported, false = not supported
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  
  // Use ref to track stream for stable callbacks
  const streamRef = useRef<MediaStream | null>(null)

  // Check if camera is supported
  useEffect(() => {
    const checkSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false)
        setPermissionState('unsupported')
        return
      }

      setIsSupported(true)

      // Check permission state if supported
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          setPermissionState(permission.state as PermissionState)
          
          permission.onchange = () => {
            setPermissionState(permission.state as PermissionState)
          }
        } catch {
          // Permission query not supported, default to 'prompt'
          setPermissionState('prompt')
        }
      }
    }

    checkSupport()
  }, [])

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'user'): Promise<MediaStream | null> => {
    // If still checking or not supported, don't proceed
    if (isSupported !== true) {
      if (isSupported === false) {
        setError(new Error('Camera not supported in this browser'))
      }
      return null
    }

    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setStream(null)
    }

    try {
      setError(null)
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1920 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)
      setPermissionState('granted')
      
      return mediaStream
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to access camera')
      setError(error)
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionState('denied')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError(new Error('No camera found'))
      }
      
      return null
    }
  }, [isSupported])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setStream(null)
    }
  }, [])

  const capturePhoto = useCallback((videoElement: HTMLVideoElement): string | null => {
    if (!videoElement || !streamRef.current) {
      return null
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return null
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  return {
    startCamera,
    stopCamera,
    capturePhoto,
    isSupported,
    permissionState,
    error,
    stream,
  }
}

