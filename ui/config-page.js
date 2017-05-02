/* global HTMLElement, customElements */

{
  const {ipcRenderer} = require('electron')

  class ConfigPage extends HTMLElement {
    connectedCallback () {
      this.toggleConfig = this.toggleConfig.bind(this)
      this.render()
    }

    toggleConfig () {
      this.classList.toggle('hidden')
      if (this.classList.contains('hidden')) {
        this._toggleButton.innerText = 'Open config'
        const topics = this._topics.value
          .split('\n')
          .filter((topic) => topic.trim())
          .slice(0, 10)
        this._topics.value = topics.join('\n')
        ipcRenderer.send('update-topics', topics)
      } else {
        this._toggleButton.innerText = 'Apply config'
      }
    }

    static handleTextAreaKeyUp (event) {
      event.stopPropagation()
      event.preventDefault()
      return false
    }

    static handleSpeedChange (event) {
      window.SLICES_LOOP_TIMEOUT = event.target.value * 1000
    }

    render () {
      this.innerHTML = ''

      this._toggleButton = document.createElement('button')
      this._toggleButton.classList.add('toggle-button')
      this._toggleButton.addEventListener('click', this.toggleConfig)

      this._speedRange = document.createElement('input')
      this._speedRange.classList.add('speed-range')
      this._speedRange.type = 'number'
      this._speedRange.min = 1
      this._speedRange.max = 20
      this._speedRange.value = 2
      this._speedRange.addEventListener('change', this.handleSpeedChange)

      this._topics = document.createElement('textarea')
      this._topics.classList.add('topic-list')
      this._topics.addEventListener('keyup', this.handleTextAreaKeyUp)
      this._topics.placeholder = `Write your topics here:
        - One per line.
        - Empty lines will be cleaned.
        - Ten maximum.
      `.replace(/ {2}/gi, '')

      this.appendChild(this._toggleButton)
      this.appendChild(this._topics)
      this.appendChild(this._speedRange)
      this.toggleConfig()
      this.toggleConfig()
    }
  }

  customElements.define('config-page', ConfigPage)
}
