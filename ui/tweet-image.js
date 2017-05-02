/* global HTMLElement, customElements, Event */

{
  class TweetImage extends HTMLElement {
    connectedCallback () {
      this.entity = JSON.parse(this.dataset.entity)
      this.dataset.entity = ''
      this._img = null
      this.handleLoadEvent = this.handleLoadEvent.bind(this)
      this.render()
    }

    disconnectedCallback () {
      if (this._img) {
        this._img.removeEventListener('load', this.handleLoadEvent)
      }
    }

    handleLoadEvent () {
      this.dispatchEvent(new Event('load'))
    }

    render () {
      this.innerHTML = ''
      const link = document.createElement('a')
      link.target = '_blank'
      this._img = document.createElement('img')
      link.appendChild(this._img)
      this._img.addEventListener('load', this.handleLoadEvent)
      this._img.src = this.entity.media_url_https || this.entity.media_url
      link.href = this._img.src
      this.appendChild(link)
    }
  }

  customElements.define('tweet-image', TweetImage)
}
