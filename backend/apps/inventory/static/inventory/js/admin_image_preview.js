(function () {
  function createPreviewContainer(input) {
    const existing = input.parentElement.querySelector('.copilot-image-preview');
    if (existing) return existing;

    const container = document.createElement('div');
    container.className = 'copilot-image-preview';
    container.style.marginTop = '8px';

    const img = document.createElement('img');
    img.style.maxHeight = '140px';
    img.style.maxWidth = '220px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '6px';
    img.style.display = 'none';

    container.appendChild(img);
    input.parentElement.appendChild(container);
    return container;
  }

  function setPreviewFromFile(input) {
    const container = createPreviewContainer(input);
    const img = container.querySelector('img');
    const file = input.files && input.files[0];

    if (!file || !file.type || !file.type.startsWith('image/')) {
      img.removeAttribute('src');
      img.style.display = 'none';
      return;
    }

    const url = URL.createObjectURL(file);
    img.src = url;
    img.style.display = 'block';

    img.onload = function () {
      URL.revokeObjectURL(url);
    };
  }

  function wireInput(input) {
    if (input.dataset.previewBound === '1') return;
    input.dataset.previewBound = '1';
    input.addEventListener('change', function () {
      setPreviewFromFile(input);
    });
  }

  function wireAllInputs(root) {
    const scope = root || document;
    const inputs = scope.querySelectorAll('input[type="file"]');
    inputs.forEach(function (input) {
      wireInput(input);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireAllInputs(document);

    document.body.addEventListener('click', function () {
      setTimeout(function () {
        wireAllInputs(document);
      }, 0);
    });
  });
})();
