/* global HTMLElement, customElements, requestAnimationFrame, Minigrid */

{
  const {ipcRenderer} = require('electron')
  const MAX_TWEETS = 200

  class TheWall extends HTMLElement {
    connectedCallback () {
      this._onLoop = false
      this._loopIntervalId = -1
      this.handleNewTweet = this.handleNewTweet.bind(this)
      this.updateChildren = this.updateChildren.bind(this)
      this.handleKeyUp = this.handleKeyUp.bind(this)
      this.requestTweets = this.requestTweets.bind(this)

      window.addEventListener('keyup', this.handleKeyUp)
      window.addEventListener('scroll', this.updateChildren)
      window.addEventListener('resize', this.updateChildren)
      ipcRenderer.on('tweet', this.handleNewTweet)

      this.toggleLoop()
    }

    disconnectedCallback () {
      clearInterval(this._loopIntervalId)
      window.removeEventListener('keyup', this.handleKeyUp)
      window.removeEventListener('scroll', this.updateChildren)
      window.removeEventListener('resize', this.updateChildren)
      ipcRenderer.removeListener('tweet', this.handleNewTweet)
    }

    handleKeyUp (event) {
      if (event.keyCode === 80) { // p
        this.toggleLoop()
      } else if (event.keyCode === 82) { // r
        window.location.reload()
      } else if (event.keyCode === 70) { // f
        this.requestTweets()
      }
    }

    requestTweets () {
      if (this._loopIntervalId !== -1) {
        clearTimeout(this._loopIntervalId)
        this._loopIntervalId = -1
      }
      ipcRenderer.send('get-tweet')
      if (this._onLoop) {
        this._loopIntervalId = setTimeout(this.requestTweets, window.SLICES_LOOP_TIMEOUT)
      }
    }

    toggleLoop () {
      clearTimeout(this._loopIntervalId)
      this._loopIntervalId = -1
      if (this._onLoop) {
        this._onLoop = false
        this.classList.add('paused')
      } else {
        this._onLoop = true
        this.requestTweets()
        this.classList.remove('paused')
      }
    }

    updateChildren () {
      for (let child of this.children) {
        requestAnimationFrame(child.updateContent)
      }
      new Minigrid({
        container: 'the-wall',
        item: 'tweet-wrapper',
        gutter: 10
      }).mount()
    }

    cleanChildren () {
      for (let i = (MAX_TWEETS / 2); i < this.children.length; i += 1) {
        this.children[i].removeEventListener('load', this.updateChildren)
        this.removeChild(this.children[i])
      }
    }

    handleNewTweet (sender, tweet) {
      const element = document.createElement('tweet-wrapper')
      element.dataset.raw = JSON.stringify(tweet)
      element.addEventListener('load', this.updateChildren)
      if (this.children.length) {
        this.insertBefore(element, this.children[0])
      } else {
        this.appendChild(element)
      }
      if (this.children.length >= MAX_TWEETS) {
        this.cleanChildren()
      }
      this.updateChildren()
    }
  }

  customElements.define('the-wall', TheWall)
}
