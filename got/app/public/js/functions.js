$(() => {
  $('#btn_sud').on('click', () => {
    $('.erros').hide()
    $.ajax({
      url: '/suditos',
      method: 'get',
      success: (data) => $('#acoes').html(data)
    })
  })

  $('#btn-per').on('click', () => {
    $('.erros').hide()
    $.ajax({
      url: '/pergaminhos',
      method: 'get',
      success: (data) => $('#acoes').html(data)
    })
  })
})