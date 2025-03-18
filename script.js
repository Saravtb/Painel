// ------------------------------
// Variáveis do painel e parâmetros
// ------------------------------
let velocidade = 0;
let altitude = 0;
let combustivel = 100; // % de combustível
let flaps = 0;
let tremPouso = false; // false: recolhido, true: baixado
let autopilot = false;  // modo piloto automático
const autonomiaTotal = 13500; // autonomia total em km com 100% de combustível

// ------------------------------
// Função para atualizar displays
// ------------------------------
function atualizarDisplay(id, valor) {
  document.getElementById(id).textContent = valor;
}

// ------------------------------
// Eventos dos botões (desabilitam controle se autopilot estiver ativo)
// ------------------------------
function controleHabilitado() {
  return !autopilot;
}

// Velocidade
document.getElementById('btnAcelerar').addEventListener('click', () => {
  if (controleHabilitado()) {
    velocidade += 10;
    // Consumo: cada aceleração consome 0.5% de combustível
    combustivel = Math.max(combustivel - 0.5, 0);
    atualizarDisplay('velocidadeDisplay', velocidade);
    atualizarDisplay('combustivelDisplay', combustivel.toFixed(1));
  }
});

document.getElementById('btnDesacelerar').addEventListener('click', () => {
  if (controleHabilitado()) {
    velocidade = Math.max(velocidade - 10, 0);
    atualizarDisplay('velocidadeDisplay', velocidade);
  }
});

// Altitude
document.getElementById('btnSubir').addEventListener('click', () => {
  if (controleHabilitado()) {
    if (velocidade >= 150) { // velocidade mínima para subir
      altitude += 100;
      atualizarDisplay('altitudeDisplay', altitude);
    } else {
      alert('Velocidade mínima para subir é 150 km/h!');
    }
  }
});

document.getElementById('btnDescer').addEventListener('click', () => {
  if (controleHabilitado()) {
    altitude = Math.max(altitude - 100, 0);
    atualizarDisplay('altitudeDisplay', altitude);
  }
});

// Flaps
document.getElementById('btnAumentarFlaps').addEventListener('click', () => {
  if (controleHabilitado() && flaps < 40) {
    flaps += 10;
    atualizarDisplay('flapsDisplay', flaps);
  }
});

document.getElementById('btnReduzirFlaps').addEventListener('click', () => {
  if (controleHabilitado() && flaps > 0) {
    flaps -= 10;
    atualizarDisplay('flapsDisplay', flaps);
  }
});

// Trem de Pouso
document.getElementById('btnAlternarTrem').addEventListener('click', () => {
  if (controleHabilitado()) {
    if (altitude < 100) { // Trem de pouso fica baixado automaticamente quando a altitude é menor que 100
      tremPouso = true;
      atualizarDisplay('tremDisplay', 'Baixado');
      alert('Altitude muito baixa! O trem de pouso foi automaticamente baixado.');
    } else if (tremPouso && velocidade >= 100) { // Recolher o trem de pouso
      tremPouso = false;
      atualizarDisplay('tremDisplay', 'Recolhido');
    } else if (!tremPouso && velocidade < 100) { // Tentativa de recolher o trem de pouso sem velocidade suficiente
      alert('O avião ainda não tem altitude para recolher o trem de pouso');
    } else { // Baixar o trem de pouso manualmente
      tremPouso = true;
      atualizarDisplay('tremDisplay', 'Baixado');
  }
}
});



// ------------------------------
// Piloto Automático
// ------------------------------
document.getElementById('btnAtivarAP').addEventListener('click', () => {
  autopilot = true;
  // Desabilita controles manuais
  document.getElementById('btnAtivarAP').disabled = true;
  document.getElementById('btnDesativarAP').disabled = false;
  
  // Define parâmetros do autopilot: velocidade de cruzeiro e altitude padrão
  const velocidadeAlvo = 800;  // km/h (valor ilustrativo)
  const altitudeAlvo = 10000;  // m
  
  // Atualiza gradualmente os valores (de forma simplificada)
  velocidade = velocidadeAlvo;
  altitude = altitudeAlvo;
  atualizarDisplay('velocidadeDisplay', velocidade);
  atualizarDisplay('altitudeDisplay', altitude);
  
  // Exibe mensagem de ativação
  alert('Piloto Automático ativado. Controle manual desabilitado.');
});

document.getElementById('btnDesativarAP').addEventListener('click', () => {
  autopilot = false;
  document.getElementById('btnAtivarAP').disabled = false;
  document.getElementById('btnDesativarAP').disabled = true;
  alert('Piloto Automático desativado. Controles manuais reativados.');
});

// ------------------------------
// Configuração do Mapa com Leaflet e OpenStreetMap
// ------------------------------
const map = L.map('map').setView([48.8566, 2.3522], 4); // Centralizado em Paris

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Coordenadas dos países (incluindo os 13 da lista)
const coordenadasPaises = {
  'BR': { lat: -14.2350, lng: -51.9253 },
  'US': { lat: 37.0902, lng: -95.7129 },
  'FR': { lat: 46.6034, lng: 1.8883 },
  'DE': { lat: 51.1657, lng: 10.4515 },
  'IT': { lat: 41.8719, lng: 12.5674 },
  'ES': { lat: 40.4637, lng: -3.7492 },
  'UK': { lat: 55.3781, lng: -3.4360 },
  'JP': { lat: 36.2048, lng: 138.2529 },
  'AU': { lat: -25.2744, lng: 133.7751 },
  'CA': { lat: 56.1304, lng: -106.3468 },
  'CN': { lat: 35.8617, lng: 104.1954 },
  'RU': { lat: 61.5240, lng: 105.3188 },
  'IN': { lat: 20.5937, lng: 78.9629 }
};

// Marcador customizado (paleta: azul escuro e dourado)
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div class="marker-pin"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

let rota, markerOrigem, markerDestino;

// Função para calcular a distância (fórmula haversine)
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raio da Terra (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  return distancia.toFixed(2);
}

// ------------------------------
// Cálculo da rota e verificação de combustível
// ------------------------------
document.getElementById('btnCalcularRota').addEventListener('click', () => {
  const origemValue = document.getElementById('origem').value;
  const destinoValue = document.getElementById('destino').value;

    // Verifica se a origem e o destino são iguais
    if (origemValue === destinoValue) {
      alert('Rota inválida! O país de origem e destino não podem ser o mesmo.');
      
      // Limpa rota e marcadores, se houver
      if (rota) { map.removeLayer(rota); rota = null; }
      if (markerOrigem) { map.removeLayer(markerOrigem); markerOrigem = null; }
      if (markerDestino) { map.removeLayer(markerDestino); markerDestino = null; }
  
      // Limpa informações de distância e tempo no display
      document.getElementById('distancia').textContent = '-';
      document.getElementById('tempoVoo').textContent = '-';
      
      return; // Sai da função, não continua
    }
  

  if (coordenadasPaises[origemValue] && coordenadasPaises[destinoValue]) {
    const origemCoords = coordenadasPaises[origemValue];
    const destinoCoords = coordenadasPaises[destinoValue];
    
    // Calcula a distância da rota
    const distancia = calcularDistancia(origemCoords.lat, origemCoords.lng, destinoCoords.lat, destinoCoords.lng);
    document.getElementById('distancia').textContent = distancia;
    
    // Calcula o tempo estimado de voo com base na velocidade atual (se velocidade > 0)
    let tempoVoo = velocidade > 0 ? (distancia / velocidade).toFixed(2) : 0;
    document.getElementById('tempoVoo').textContent = tempoVoo;
    
    // Verifica se há combustível suficiente:
    // Combustível disponível em km = (combustível% / 100) * autonomiaTotal
    const combustivelDisponivel = (combustivel / 100) * autonomiaTotal;
    if (distancia > combustivelDisponivel) {
      alert('Combustível insuficiente para realizar o voo!');
      return;
    }
    
    // Remove rota e marcadores antigos (se existirem)
    if (rota) { map.removeLayer(rota); }
    if (markerOrigem) { map.removeLayer(markerOrigem); }
    if (markerDestino) { map.removeLayer(markerDestino); }
    
    // Desenha a rota no mapa
    rota = L.polyline([
      [origemCoords.lat, origemCoords.lng],
      [destinoCoords.lat, destinoCoords.lng]
    ], { color: '#FFD700', weight: 4 }).addTo(map);
    
    // Adiciona marcadores customizados
    markerOrigem = L.marker([origemCoords.lat, origemCoords.lng], { icon: customIcon }).addTo(map);
    markerDestino = L.marker([destinoCoords.lat, destinoCoords.lng], { icon: customIcon }).addTo(map);
    
    // Ajusta o zoom e centraliza a rota
    map.fitBounds(rota.getBounds());
    
  } else {
    alert('Selecione países válidos!');
  }
});
