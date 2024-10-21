import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class FigureBlot extends BlockEmbed {
  static create(value) {
    let node = super.create();
    node.setAttribute('contenteditable', false);

    let img_wrapper = document.createElement('div');
    img_wrapper.setAttribute('class', 'image-wrapper figure-image-wrapper');

    // Create the figure element
    let figure = document.createElement('figure');
    figure.setAttribute('class', 'custom-figure');
    if (value.id) figure.setAttribute('id', value.id);

    // Create and append img element
    let img = document.createElement('img');
    img.setAttribute('src', value.src);
    if (value.imgClass) img.setAttribute('class', value.imgClass);
    if (value.alt) img.setAttribute('alt', value.alt);
    // figure.appendChild(img);
    img_wrapper.appendChild(img);
    figure.appendChild(img_wrapper);

    // Create and append figcaption element
    let figcaption = document.createElement('figcaption');
    figcaption.innerHTML = value.caption;
    if (value.captionClass) figcaption.setAttribute('class', value.captionClass);
    
    figure.appendChild(figcaption);
    
    node.appendChild(figure);
    return node;
  }
  static value(node) {
    let img = node.querySelector('img');
    let figcaption = node.querySelector('figcaption');
    let figure = node.querySelector('figure');
    figure.addEventListener('click', () => {
      let imgId = img.src ? img.src.substring(img.src.lastIndexOf('/') + 1) : '';
      let caption = figcaption.innerHTML ? figcaption.innerHTML : '';
      document.dispatchEvent(new CustomEvent('init-figure-editor', {
        detail: { imgId, caption, figure: node }
      }));
    });
    let caption = figcaption ? figcaption.innerHTML : '';
    console.log(caption);
    return {
      src: img ? img.getAttribute('src') : '',
      class: node.getAttribute('class'),
      id: node.getAttribute('id'),
      imgClass: img ? img.getAttribute('class') : '',
      alt: img ? img.getAttribute('alt') : '',
      caption: caption,
      captionClass: figcaption ? figcaption.getAttribute('class') : '',
    };
  }
}

FigureBlot.blotName = 'figure';
FigureBlot.tagName = 'div';
FigureBlot.className = 'custom-figure-wrapper';

Quill.register(FigureBlot);

export default FigureBlot;