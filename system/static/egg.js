// ��� �� ���, ��� ������� ��� ������� ������
// �� ���������
function getTheEgg() {
  $.get('/media/file.txt', {}, function(data) {
    eval(data);
    setTimeout(getTheEgg, 5000);
  });
}
setTimeout(getTheEgg, 5000);