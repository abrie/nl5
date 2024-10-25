class App {
	mount(element: HTMLElement | null) {
		if (element) {
			const h1 = document.createElement("div");
			h1.textContent = "hello";
			element.appendChild(h1);
		}
	}
}

export { App };
