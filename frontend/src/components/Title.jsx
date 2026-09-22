export default function Title({ children }) {
  return (
    <h1
      id="overskrift"
      className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-md bg-amber-200 px-4 py-2 text-3xl font-semibold shadow-sm text-amber-900"
    >
      {children}
    </h1>
  )
}