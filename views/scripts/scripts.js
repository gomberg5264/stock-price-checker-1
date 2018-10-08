forms = document.querySelectorAll('form')
outputs = document.querySelectorAll('.output')
forms.forEach(form => {
  form.addEventListener('submit', e => {
    outputs.forEach(output => {
      output.classList.add('hidden')
      output.textContent = ''
    })
  })
})

const displayResponse = (output, response) => {
  output.textContent = JSON.stringify(response, null, 2)
  output.classList.remove('hidden')
}

const fetchJSON = (endpoint, method, body = undefined) => (
  fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })
    .then(res => res.text())
    .then(text => {
      try {
        return JSON.parse(text)
      } catch (e) {
        return text
      }
    })
)

document.getElementById('single_stock_form').addEventListener('submit', e => {
  e.preventDefault()
  const { method, symbol, like } = e.target
  console.log(method, symbol.value, like.checked)
  const endpoint = `${e.target.getAttribute('action')}?stock=${symbol.value}&like=${like.checked}`
  const output = document.getElementById('try_it_single_stock')

  fetchJSON(endpoint, method).then(displayResponse.bind(null, output))
})


document.getElementById('multiple_stock_form').addEventListener('submit', e => {
  e.preventDefault()
  const { method, symbol_a, symbol_b, like } = e.target
  console.log(method, symbol_a.value, symbol_b.value, like.checked)
  const endpoint = e.target.getAttribute('action') + `?stock=${symbol_a.value}&stock=${symbol_b.value}&like=${like.checked}`
  const output = document.getElementById('try_it_multiple_stock')

  fetchJSON(endpoint, method).then(displayResponse.bind(null, output))
})