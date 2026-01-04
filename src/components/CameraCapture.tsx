import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCamera } from '@/hooks/useCamera'
import { compressImage } from '@/utils/imageUtils'
import styles from './CameraCapture.module.css'

interface CameraCaptureProps {
  onCapture: (base64: string) => void
  onCancel: () => void
  facingMode?: 'user' | 'environment'
}

type CaptureState = 'idle' | 'preview' | 'captured' | 'processing' | 'error'

export function CameraCapture({
  onCapture,
  onCancel,
  facingMode = 'user',
}: CameraCaptureProps) {
  const { startCamera, stopCamera, capturePhoto, isSupported, permissionState, error: cameraError, stream } = useCamera()
  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  // Start camera when component mounts and support check is complete
  useEffect(() => {
    mountedRef.current = true
    
    const initCamera = async () => {
      // Wait for support check to complete (isSupported is null while checking)
      if (isSupported === null) {
        return
      }
      
      if (isSupported === false) {
        setError('Camera not supported in this browser')
        setCaptureState('error')
        return
      }
      
      if (permissionState === 'denied') {
        return
      }

      const mediaStream = await startCamera(facingMode)
      
      if (!mountedRef.current) return
      
      if (mediaStream && videoRef.current) {
        // Set up video element with the stream
        videoRef.current.srcObject = mediaStream
        
        // Wait for video to be ready before playing
        videoRef.current.onloadedmetadata = async () => {
          if (!mountedRef.current || !videoRef.current) return
          
          try {
            // Store the play promise to handle interruption
            playPromiseRef.current = videoRef.current.play()
            await playPromiseRef.current
            if (mountedRef.current) {
              setIsVideoReady(true)
            }
          } catch (err) {
            // Only log if it's not an abort error (which happens on unmount)
            if (err instanceof Error && err.name !== 'AbortError') {
              console.error('Failed to play video:', err)
              if (mountedRef.current) {
                setError('Failed to start camera preview')
              }
            }
          } finally {
            playPromiseRef.current = null
          }
        }
      } else if (!mediaStream && mountedRef.current) {
        setError('Failed to access camera')
        setCaptureState('error')
      }
    }

    initCamera()

    return () => {
      mountedRef.current = false
      setIsVideoReady(false)
      
      // Clean up video element properly
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null
        videoRef.current.srcObject = null
      }
      
      stopCamera()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, isSupported])

  const handleCapture = useCallback(async () => {
    if (!stream || !videoRef.current) {
      setError('Camera not ready')
      return
    }

    const photo = capturePhoto(videoRef.current)
    if (!photo) {
      setError('Failed to capture photo')
      return
    }

    setCapturedImage(photo)
    setCaptureState('captured')
    setIsVideoReady(false)
    
    // Clean up video element before stopping camera
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    stopCamera()
  }, [stream, capturePhoto, stopCamera])

  const handleRetake = useCallback(async () => {
    setCapturedImage(null)
    setCaptureState('idle')
    setError(null)
    setIsVideoReady(false)

    const mediaStream = await startCamera(facingMode)
    
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream
      
      videoRef.current.onloadedmetadata = async () => {
        if (!videoRef.current) return
        
        try {
          await videoRef.current.play()
          setIsVideoReady(true)
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error('Failed to play video:', err)
            setError('Failed to restart camera')
          }
        }
      }
    } else {
      setError('Failed to restart camera')
    }
  }, [startCamera, facingMode])

  const handleUsePhoto = useCallback(async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    setCaptureState('processing')

    try {
      // Convert base64 to File for compression
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })

      // Compress image
      const compressed = await compressImage(file)
      onCapture(compressed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
      setCaptureState('error')
    } finally {
      setIsProcessing(false)
    }
  }, [capturedImage, onCapture])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setIsProcessing(true)
    setCaptureState('processing')

    try {
      const compressed = await compressImage(file)
      onCapture(compressed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
      setCaptureState('error')
    } finally {
      setIsProcessing(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [onCapture])

  const handleCancel = useCallback(() => {
    stopCamera()
    onCancel()
  }, [stopCamera, onCancel])

  // Handle permission denied
  if (permissionState === 'denied' || cameraError) {
    return (
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="camera-error-title">
        <div className={styles.modalContent}>
          <h3 id="camera-error-title" className={styles.title}>Camera Access Denied</h3>
          <p className={styles.message}>
            {cameraError?.message || 'Camera access is required to take a selfie. Please enable camera permissions in your browser settings.'}
          </p>
          <div className={styles.fallback}>
            <label htmlFor="file-input" className={styles.fileLabel}>
              Choose Photo from Device
            </label>
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileSelect}
              className={styles.fileInput}
              aria-label="Choose photo from device"
            />
          </div>
          <div className={styles.actions}>
            <button onClick={handleCancel} className={styles.button}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle not supported (only when check is complete)
  if (isSupported === false) {
    return (
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="camera-unsupported-title">
        <div className={styles.modalContent}>
          <h3 id="camera-unsupported-title" className={styles.title}>Camera Not Supported</h3>
          <p className={styles.message}>
            Your browser doesn't support camera access. You can still add a photo from your device.
          </p>
          <div className={styles.fallback}>
            <label htmlFor="file-input-fallback" className={styles.fileLabel}>
              Choose Photo from Device
            </label>
            <input
              id="file-input-fallback"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
              aria-label="Choose photo from device"
            />
          </div>
          <div className={styles.actions}>
            <button onClick={handleCancel} className={styles.button}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="camera-title">
      <div className={styles.modalContent}>
        <h3 id="camera-title" className={styles.title}>Take a Selfie</h3>

        <AnimatePresence mode="wait">
          {captureState === 'idle' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVideoReady ? 1 : 0.3 }}
              exit={{ opacity: 0 }}
              className={styles.previewContainer}
            >
              <video
                ref={videoRef}
                className={styles.video}
                autoPlay
                playsInline
                muted
                aria-label="Camera preview"
              />
              {!isVideoReady && (
                <div className={styles.processing}>
                  <div className={styles.spinner} aria-label="Starting camera" />
                  <p>Starting camera...</p>
                </div>
              )}
              {isVideoReady && (
                <div className={styles.overlay}>
                  <button
                    onClick={handleCapture}
                    className={styles.captureButton}
                    aria-label="Capture photo"
                    disabled={!stream || !isVideoReady}
                  >
                    <span className={styles.captureButtonInner} />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {captureState === 'captured' && capturedImage && (
            <motion.div
              key="captured"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.previewContainer}
            >
              <img
                src={capturedImage}
                alt="Captured photo preview"
                className={styles.previewImage}
              />
              <div className={styles.previewActions}>
                <button
                  onClick={handleRetake}
                  className={`${styles.previewButton} ${styles.previewButtonRetake}`}
                  aria-label="Retake photo"
                >
                  Retake
                </button>
                <button
                  onClick={handleUsePhoto}
                  className={`${styles.previewButton} ${styles.previewButtonUse}`}
                  aria-label="Use this photo"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Saving...' : 'Use Photo'}
                </button>
              </div>
            </motion.div>
          )}

          {captureState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.processing}
            >
              <div className={styles.spinner} aria-label="Processing image" />
              <p>Processing image...</p>
            </motion.div>
          )}

          {captureState === 'error' && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.error}
            >
              <p>{error}</p>
              <div className={styles.actions}>
                <button onClick={handleRetake} className={styles.button}>
                  Try Again
                </button>
                <button onClick={handleCancel} className={styles.button}>
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.actions}>
          <button
            onClick={handleCancel}
            className={styles.button}
            aria-label="Cancel camera capture"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

