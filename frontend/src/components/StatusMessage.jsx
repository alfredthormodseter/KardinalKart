export default function StatusMessage({ message, type = '' }) {
  return (
    <div id="Status" className={type}>
      {message}
    </div>
  )
}