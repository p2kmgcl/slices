/* global HTMLElement, customElements, linkifyStr */

{
  class TweetContent extends HTMLElement {
    connectedCallback () {
      this.text = this.dataset.text
      this.dataset.text = ''
      this.render()
    }

    render () {
      const tempNode = document.createElement('span')
      tempNode.innerHTML = linkifyStr(this.text)
      tempNode.querySelectorAll('a').forEach((link) => tempNode.removeChild(link))
      tempNode.innerHTML = tempNode.innerHTML
        .replace(/#([a-z0-9_]+)/gi, (original, $1) => `<a target="_blank" href="https://twitter.com/search?q=${encodeURIComponent($1)}">${original}</a>`)
        .replace(/@([a-z0-9_]+)/gi, (original, $1) => `<a target="_blank" href="https://twitter.com/${encodeURIComponent($1)}">${original}</a>`)
      this.innerHTML = tempNode.innerHTML
    }
  }

  customElements.define('tweet-content', TweetContent)
}
