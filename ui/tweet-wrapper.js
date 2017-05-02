/* global HTMLElement, customElements, Event */

{
  class TweetWrapper extends HTMLElement {
    connectedCallback () {
      this.data = JSON.parse(this.dataset.raw)
      this.dataset.raw = ''
      this.updateContent = this.updateContent.bind(this)
      this.handleMediaLoad = this.handleMediaLoad.bind(this)
      this._textNode = null
      this._mediaNode = null
      this.render()
    }

    disconnectedCallback () {
      if (this._mediaNode) {
        this._mediaNode.removeEventListener('load', this.handleMediaLoad)
      }
    }

    get textNode () {
      if (this._textNode) return this._textNode
      this._textNode = document.createElement('tweet-content')
      this._textNode.dataset.text = this.data.text
      return this._textNode
    }

    get mediaNode () {
      if (this._mediaNode) return this._mediaNode
      this._mediaNode = document.createElement('span')
      const entities = (this.data.entities.media || [])
        .concat((this.data.extended_entities || {}).media || [])

      for (let entity of entities) {
        switch (entity.type) {
          case 'photo':
            this._mediaNode = document.createElement('tweet-image')
            this._mediaNode.dataset.entity = JSON.stringify(entity)
            break
          case 'video':
            this._mediaNode = document.createElement('tweet-video')
            this._mediaNode.dataset.entity = JSON.stringify(entity)
            break
        }
      }
      return this._mediaNode
    }

    handleMediaLoad () {
      this.dispatchEvent(new Event('load'))
    }

    updateContent () {
      const rect = this.getBoundingClientRect()
      if ((rect.bottom < 0) || (rect.top > window.innerHeight)) {
        if (typeof this._mediaNode.pause === 'function') this._mediaNode.pause()
      } else {
        if (typeof this._mediaNode.play === 'function') this._mediaNode.play()
      }
    }

    render () {
      this.innerHTML = ''
      this.mediaNode.addEventListener('load', this.handleMediaLoad)
      this.appendChild(this.textNode)
      this.appendChild(this.mediaNode)
    }
  }

  customElements.define('tweet-wrapper', TweetWrapper)
}
