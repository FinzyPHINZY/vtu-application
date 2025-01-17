export default function swDev () {
    const swUrl = `${window.location.origin}/sw.ts`;
    navigator.serviceWorker.register(swUrl).then((response) => {
        console.warn("response", response);
    }).catch((error) => {
        console.error("Service worker registration failed:", error);
    });
}

// export default function swDev() {
//     const swUrl = `${window.location.origin}/sw.js`;
//     navigator.serviceWorker.register(swUrl).then((response) => {
//         console.warn("response", response);
//     }).catch((error) => {
//         console.error("Service worker registration failed:", error);
//     });
// }