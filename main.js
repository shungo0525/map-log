
const GAS_API = 'https://script.google.com/macros/s/AKfycbyQ-1EUcHFVEGoO8uDAK9rh-SlYlDsNJTpQwzX-zVLf154PBIRnudCOk8JWBB5imwot/exec';
const saveBtn = document.getElementById('saveBtn');
let lastClickedLatLng = null;
let popup = null;

// 初期表示時に自動でGASのデータ読み込み
window.onload = fetchAndDisplayTable;

// Leaflet地図初期化
const map = L.map('map').setView([34.6937, 135.5023], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// テーブル描画関数
function renderTable(data) {
  const tableContainer = document.getElementById('table-container');
  let html = '<table border="1" cellpadding="5"><thead><tr>';

  // ヘッダー
  data[0].forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';

  // データ行
  for (let i = 1; i < data.length; i++) {
    html += '<tr>';
    data[i].forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  }

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}

// GASにデータ送信
function saveData() {
  if (lastClickedLatLng) {
    const jsonData = {
      lat: parseFloat(lastClickedLatLng.lat.toFixed(6)),
      lng: parseFloat(lastClickedLatLng.lng.toFixed(6))
    };
    console.log("GAS送信データ:", JSON.stringify(jsonData));
    fetch(GAS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(jsonData)
    })
      .then(res => res.json())
      .then(data => {
        alert('保存完了');
        fetchAndDisplayTable(); // 保存後に再読み込み
      })
      .catch(err => alert('保存失敗: ' + err));
  }
}

// GASからデータ取得
async function fetchAndDisplayTable() {
  try {
    const res = await fetch(GAS_API);
    const data = await res.json();
    console.log("GAS取得データ:", data);
    renderTable(data);
  } catch (err) {
    console.error("API取得エラー:", err);
  }
}

// クリック時の位置情報ポップアップ表示
map.on('click', function (e) {
  lastClickedLatLng = e.latlng;
  const latlngStr = `緯度: ${e.latlng.lat.toFixed(6)}, 経度: ${e.latlng.lng.toFixed(6)}`;
  console.log(latlngStr);

  if (popup) popup.remove();
  popup = L.popup().setLatLng(e.latlng).setContent(latlngStr).openOn(map);

  popup.on('close', () => {
    saveBtn.disabled = true;
    lastClickedLatLng = null;
  });

  saveBtn.disabled = false;
});
