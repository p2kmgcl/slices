/* global HTMLElement, customElements, Event */

{
  class TweetVideo extends HTMLElement {
    connectedCallback () {
      this.entity = JSON.parse(this.dataset.entity)
      this.dataset.entity = ''
      this.handleLoadEvent = this.handleLoadEvent.bind(this)
      this._video = null
      this.render()
    }

    disconnectedCallback () {
      if (this._video) {
        this._video.removeEventListener('loadeddata', this.handleLoadEvent)
      }
    }

    handleLoadEvent () {
      this.dispatchEvent(new Event('load'))
    }

    pause () {
      if (this._video) this._video.pause()
    }

    play () {
      if (this._video && this._video.paused) {
        this._video.play()
      }
    }

    render () {
      this.innerHTML = ''
      this._video = document.createElement('video')
      this._video.addEventListener('loadeddata', this.handleLoadEvent)
      this._video.autoplay = true
      this._video.controls = true
      this._video.loop = true
      this._video.muted = true
      this.entity.video_info.variants.forEach((variant) => {
        const source = document.createElement('source')
        source.type = variant.content_type
        source.src = variant.url
        this._video.appendChild(source)
      })
      this.appendChild(this._video)
    }
  }

  customElements.define('tweet-video', TweetVideo)
}
