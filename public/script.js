// Basic teleprompter logic
window.addEventListener('load', () => {
  const teleprompter = document.getElementById('teleprompter');
  let scrollY = 0;
  function step() {
    scrollY += 1;
    window.scrollTo(0, scrollY);
    requestAnimationFrame(step);
  }
  step();
});
