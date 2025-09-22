import { useEffect } from 'react'

export default function ScrollbarGutter() {
  useEffect(() => {
    function updateScrollbarGutterFallback() {
      // Measure browser scrollbar width (difference between innerWidth and clientWidth)
      const sbWidth = window.innerWidth - document.documentElement.clientWidth
      console.log('ScrollbarGutter: Measured scrollbar width:', sbWidth + 'px')
      
      // CSS variable for use by components that need to offset fixed elements
      document.documentElement.style.setProperty('--scrollbar-width', sbWidth ? `${sbWidth}px` : '0px')

      // Apply padding directly to header to ensure it doesn't overlap scrollbar
      const header = document.querySelector('header')
      if (header) {
        const paddingValue = Math.max(sbWidth, 14)
        const paddingRight = `${paddingValue}px`
        console.log('ScrollbarGutter: Applying padding-right to header:', paddingRight)
        
        header.style.paddingRight = paddingRight
        header.style.boxSizing = 'border-box'
        header.style.width = 'auto'
        header.style.left = '0'
        header.style.right = '0'
        
        console.log('ScrollbarGutter: Header styles applied successfully')
      } else {
        console.log('ScrollbarGutter: Header element not found!')
      }
    }

    // Update on load and resize; debounce to avoid thrash
    let t
    function onResize() {
      clearTimeout(t)
      t = setTimeout(updateScrollbarGutterFallback, 120)
    }

    updateScrollbarGutterFallback()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return null
}
