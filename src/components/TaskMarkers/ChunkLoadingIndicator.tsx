
interface ChunkLoadingIndicatorProps {
  chunksLoaded: number
  totalChunks: number
  isVisible: boolean
}

export const ChunkLoadingIndicator = ({
  chunksLoaded,
  totalChunks,
  isVisible,
}: ChunkLoadingIndicatorProps) => {
  if (!isVisible) return null
  
  const progress = totalChunks > 0 ? (chunksLoaded / totalChunks) * 100 : 0

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            minWidth: '280px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '18px',
                height: '18px',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Rendering task markers...</span>
          </div>
          <div style={{ marginLeft: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                Chunk {chunksLoaded} of {totalChunks}
              </span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{Math.round(progress)}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  )
}

