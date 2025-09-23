// Memory Leak Detection Utility
// Add this to your development environment to monitor potential leaks

class MemoryLeakDetector {

  constructor() {
    this.listeners = new Map()
    this.timers = new Set()
    this.observers = new Set()
    this.intervals = new Set()
    this.rafIds = new Set()

    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    ) {
      this.setupMonitoring()
    }
  }

  setupMonitoring() {
  // Only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Track event listeners
  this.wrapMethod(document, 'addEventListener', 'removeEventListener')
  this.wrapMethod(window, 'addEventListener', 'removeEventListener')

  // Track timers
  this.wrapTimer('setTimeout', 'clearTimeout', this.timers)
  this.wrapTimer('setInterval', 'clearInterval', this.intervals)

  // Track requestAnimationFrame
  this.wrapRAF()

  // Track observers
  this.wrapObserver('IntersectionObserver')
  this.wrapObserver('MutationObserver')
  this.wrapObserver('ResizeObserver')

  // Log status every 30 seconds in development
  setInterval(() => this.logStatus(), 30000)
  }

  wrapMethod(target, addMethod, removeMethod) {
    const originalAdd = target[addMethod]
    const originalRemove = target[removeMethod]
    
    target[addMethod] = (...args) => {
      const [event, listener] = args
      const key = `${target.constructor.name}-${event}-${listener.toString().slice(0, 50)}`
      
      if (!this.listeners.has(key)) {
        this.listeners.set(key, 0)
      }
      this.listeners.set(key, this.listeners.get(key) + 1)
      
      return originalAdd.apply(target, args)
    }
    
    target[removeMethod] = (...args) => {
      const [event, listener] = args
      const key = `${target.constructor.name}-${event}-${listener.toString().slice(0, 50)}`
      
      if (this.listeners.has(key)) {
        const count = this.listeners.get(key)
        if (count <= 1) {
          this.listeners.delete(key)
        } else {
          this.listeners.set(key, count - 1)
        }
      }
      
      return originalRemove.apply(target, args)
    }
  }

  wrapTimer(setMethod, clearMethod, storage) {
    if (typeof window === 'undefined') return;
    
    const originalSet = window[setMethod]
    const originalClear = window[clearMethod]
    
    window[setMethod] = (...args) => {
      const id = originalSet.apply(window, args)
      storage.add(id)
      return id
    }
    
    window[clearMethod] = (id) => {
      storage.delete(id)
      return originalClear.call(window, id)
    }
  }

  wrapRAF() {
    if (typeof window === 'undefined') return;
    
    const originalRAF = window.requestAnimationFrame
    const originalCAF = window.cancelAnimationFrame
    
    window.requestAnimationFrame = (callback) => {
      const id = originalRAF.call(window, callback)
      this.rafIds.add(id)
      return id
    }
    
    window.cancelAnimationFrame = (id) => {
      this.rafIds.delete(id)
      return originalCAF.call(window, id)
    }
  }

  wrapObserver(observerName) {
    if (typeof window === 'undefined' || !window[observerName]) return
    
    const OriginalObserver = window[observerName]
    
    window[observerName] = class extends OriginalObserver {
      constructor(...args) {
        super(...args)
        memoryLeakDetector.observers.add(this)
      }
      
      disconnect() {
        memoryLeakDetector.observers.delete(this)
        return super.disconnect()
      }
    }
  }

  logStatus() {
    console.group('🔍 Memory Leak Detection Report')
    
    console.log(`📡 Active Event Listeners: ${this.listeners.size}`)
    if (this.listeners.size > 0) {
      console.table(Object.fromEntries(this.listeners))
    }
    
    console.log(`⏰ Active Timeouts: ${this.timers.size}`)
    console.log(`🔄 Active Intervals: ${this.intervals.size}`)
    console.log(`🎯 Active Observers: ${this.observers.size}`)
    console.log(`🎬 Active RAF IDs: ${this.rafIds.size}`)
    
    // Memory usage
    if (performance.memory) {
      const memory = performance.memory
      console.log(`💾 Memory Usage:`)
      console.log(`  Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`  Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`  Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`)
    }
    
    // Warnings
    if (this.listeners.size > 50) {
      console.warn('⚠️  High number of event listeners detected!')
    }
    if (this.timers.size > 20) {
      console.warn('⚠️  High number of active timeouts detected!')
    }
    if (this.observers.size > 10) {
      console.warn('⚠️  High number of active observers detected!')
    }
    
    console.groupEnd()
  }

  // Manual cleanup for testing
  forceCleanup() {
    console.log('🧹 Forcing cleanup of tracked resources...')
    
    // Clear all tracked timers
    this.timers.forEach(id => clearTimeout(id))
    this.intervals.forEach(id => clearInterval(id))
    this.rafIds.forEach(id => cancelAnimationFrame(id))
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (e) {
        console.warn('Failed to disconnect observer:', e)
      }
    })
    
    this.timers.clear()
    this.intervals.clear()
    this.rafIds.clear()
    this.observers.clear()
    
    console.log('✅ Cleanup complete')
  }
}

// Initialize in development only
let memoryLeakDetector
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  memoryLeakDetector = new MemoryLeakDetector()
  
  // Make it available globally for debugging
  window.memoryLeakDetector = memoryLeakDetector
  
  console.log('🔍 Memory Leak Detector initialized')
  console.log('Use window.memoryLeakDetector.logStatus() to check current status')
  console.log('Use window.memoryLeakDetector.forceCleanup() to force cleanup')
}

export default memoryLeakDetector