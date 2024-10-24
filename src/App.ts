class App {
  mount(element: HTMLElement | null) {
    if (element) {
      const h1 = document.createElement('h1');
      h1.textContent = 'Hello, World!';
      element.appendChild(h1);
    }
  }
}

export { App };
