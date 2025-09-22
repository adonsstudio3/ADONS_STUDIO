import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ScrollToTop() {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = () => {
      console.log('ScrollToTop: Route changed, scrolling to top')
      window.scrollTo(0, 0)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('routeChangeStart', handleRouteChange)

    // Cleanup function
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  return null
}