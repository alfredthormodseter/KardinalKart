import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

export default function StatusMessage({ message, type = '' }) {
  if (!message) return null

  const isError = type === 'error'

  return (
    <Alert
      variant={isError ? 'destructive' : 'default'}
      className="absolute bottom-4 left-4 z-[2000] w-fit max-w-md rounded-md"
    >
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}