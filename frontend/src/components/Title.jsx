export default function Title({ children }) {
    return (
        <h1
            id="overskrift"
            className="fixed left-1/2 top-4 z-[2001] -translate-x-1/2 px-4 py-2 text-3xl font-semibold text-[#0f172a]"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
        >
          {children}
        </h1>
    )
}