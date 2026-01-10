theme.counter__Number = (function() {
  class CounterNumber {
    constructor(section) {
      this.container = section;
      this.counterElements = this.container.querySelectorAll('.counter-stats__number');
      this.animated = false;
      this.init();
    }

    init() {
      // Initialize Intersection Observer
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated) {
            this.startCounters();
            this.animated = true;
          }
        });
      }, { threshold: 0.2 });

      this.observer.observe(this.container);
    }

    startCounters() {
      this.counterElements.forEach(counter => {
        const targetNumber = counter.dataset.counter;
        const animation = new CounterAnimation(counter, targetNumber);
        animation.start();
      });
    }

    onUnload() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  class CounterAnimation {
    constructor(element, targetNumber) {
      this.element = element;
      this.targetNumber = parseInt(targetNumber);
      this.currentNumber = 0;
      this.increment = Math.ceil(this.targetNumber / 100);
      this.interval = 20;
    }

    start() {
      const timer = setInterval(() => {
        this.currentNumber += this.increment;
        if (this.currentNumber >= this.targetNumber) {
          this.currentNumber = this.targetNumber;
          clearInterval(timer);
        }
        this.element.textContent = this.formatNumber(this.currentNumber);
      }, this.interval);
    }

    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + ' MILLION';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
  }

  return CounterNumber;
})();