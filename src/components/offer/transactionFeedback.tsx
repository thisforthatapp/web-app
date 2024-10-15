import { animated, useSpring } from 'react-spring'

interface TransactionFeedbackProps {
  status: WriteContractResult['status']
  error: Error | null
  onRequestClose: () => void
  onReset: () => void
}

const TransactionFeedback: React.FC<TransactionFeedbackProps> = ({
  status,
  error,
  onRequestClose,
  onReset,
}) => {
  const fadeIn = useSpring({
    opacity: status !== 'idle' ? 1 : 0,
    config: { duration: 200 },
  })

  if (status === 'idle') return null

  return (
    <animated.div
      style={fadeIn}
      className='absolute inset-0 bg-white flex flex-col items-center justify-center z-50 p-6 rounded-[15px]'
    >
      {status === 'pending' && (
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6'></div>
          <h2 className='text-2xl font-bold mb-4'>Purchasing your tickets</h2>
          <p className='text-lg'>Hold on tight, luck is on its way!</p>
        </div>
      )}
      {status === 'success' && (
        <div className='text-center'>
          <div className='text-7xl mb-6'>🎟️</div>
          <h2 className='text-3xl font-bold mb-4'>Tickets Secured!</h2>
          <p className='text-xl mb-2'>You&apos;re officially in the game.</p>
          <p className='text-lg mb-8'>May fortune smile upon you!</p>
          <button
            onClick={onRequestClose}
            className='px-6 py-3 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition-colors duration-200'
          >
            Back to Game
          </button>
        </div>
      )}
      {status === 'error' && (
        <div className='text-center max-w-md w-full'>
          <div className='text-7xl mb-6'>😕</div>
          <h2 className='text-3xl font-bold mb-4'>Oops! A slight hiccup.</h2>
          <div className='mb-8 max-h-40 overflow-y-auto bg-gray-100 rounded-lg p-4'>
            <p className='text-lg'>
              {error?.message || "We couldn't process your ticket purchase. Want to try again?"}
            </p>
          </div>
          <button
            onClick={onReset}
            className='px-6 py-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-colors duration-200'
          >
            Give it Another Shot
          </button>
        </div>
      )}
    </animated.div>
  )
}

export default TransactionFeedback
