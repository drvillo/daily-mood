import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommentInput } from './CommentInput'
import { CameraCapture } from './CameraCapture'
import styles from './MoodEntryOptions.module.css'

interface MoodEntryOptionsProps {
  onCommentChange: (comment: string) => void
  onPhotoCapture: (base64: string) => void
  onPhotoRemove: () => void
  onCommentFocus?: () => void
  onCommentBlur?: () => void
  onCameraOpen?: () => void
  initialComment?: string
  initialPhoto?: string
}

export function MoodEntryOptions({
  onCommentChange,
  onPhotoCapture,
  onPhotoRemove,
  onCommentFocus,
  onCommentBlur,
  onCameraOpen,
  initialComment = '',
  initialPhoto,
}: MoodEntryOptionsProps) {
  const [comment, setComment] = useState(initialComment)
  const [photo, setPhoto] = useState<string | null>(initialPhoto || null)
  const [showCamera, setShowCamera] = useState(false)

  const handleCommentChange = useCallback(
    (value: string) => {
      setComment(value)
      onCommentChange(value)
    },
    [onCommentChange]
  )

  const handlePhotoCapture = useCallback(
    (base64: string) => {
      setPhoto(base64)
      setShowCamera(false)
      onPhotoCapture(base64)
    },
    [onPhotoCapture]
  )

  const handlePhotoRemove = useCallback(() => {
    setPhoto(null)
    onPhotoRemove()
  }, [onPhotoRemove])

  const handleCameraClick = useCallback(() => {
    setShowCamera(true)
    onCameraOpen?.()
  }, [onCameraOpen])

  const handleCameraCancel = useCallback(() => {
    setShowCamera(false)
  }, [])

  return (
    <>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className={styles.options}>
          <div className={styles.commentSection}>
            <CommentInput
              value={comment}
              onChange={handleCommentChange}
              onFocus={onCommentFocus}
              onBlur={onCommentBlur}
              placeholder="Add a note (optional)"
            />
          </div>

          <div className={styles.photoSection}>
            {photo ? (
              <div className={styles.photoPreview}>
                <img
                  src={photo}
                  alt="Mood entry photo"
                  className={styles.photoThumbnail}
                />
                <button
                  onClick={handlePhotoRemove}
                  className={styles.removeButton}
                  aria-label="Remove photo"
                  title="Remove photo"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleCameraClick}
                className={styles.cameraButton}
                aria-label="Take a selfie"
                type="button"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className={styles.cameraButtonText}>Take a Selfie</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={handleCameraCancel}
            facingMode="user"
          />
        )}
      </AnimatePresence>
    </>
  )
}

