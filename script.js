let velocidade = 0;
let altitude = 0;
let flaps = 0;
let direcao = "Norte";
let tremPouso = "Baixado";
let rota;
let combustivel = 100;  // Inicialmente, 100% de combustível

const coordenadas = {
    'BR': [-14.2350, -51.9253],  
    'US': [37.0902, -95.7129],   
    'FR': [46.6034, 1.8883], 
    'JP': [36.2048, 138.2529],   
    'DE': [51.1657, 10.4515],    
    'UK': [55.3781, -3.4360],    
    'CA': [56.1304, -106.3468],  
    'AU': [-25.2744, 133.7751],  
    'RU': [61.5240, 105.3188],   
    'CN': [35.8617, 104.1954],   
    'IN': [20.5937, 78.9629],    
    'ZA': [-30.5595, 22.9375]     
};

const mapa = L.map('mapa-container').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

// Função para alterar o nível de velocidade
function alterarVelocidade(valor) {
    velocidade = Math.max(0, velocidade + valor);
    document.getElementById('velocidade').textContent = velocidade;
    calcularDistancia();
}

// Função para alterar a altitude
function alterarAltitude(valor) {
    if (velocidade >= 200 || valor < 0) {
        altitude = Math.max(0, altitude + valor);
        document.getElementById('altitude').textContent = altitude;
    }
}

// Função para ajustar os flaps
function ajustarFlaps(valor) {
    flaps = Math.min(40, Math.max(0, flaps + valor));
    document.getElementById('flaps').textContent = flaps;
}

// Função para mudar a direção
function mudarDirecao(sentido) {
    const direcoes = ["Norte", "Leste", "Sul", "Oeste"];
    let index = direcoes.indexOf(direcao);
    if (sentido === "direita") index = (index + 1) % 4;
    else index = (index - 1 + 4) % 4;
    direcao = direcoes[index];
    document.getElementById("direcao").textContent = direcao;
}

// Função para alternar o trem de pouso
function alternarTrem() {
    tremPouso = tremPouso === "Baixado" ? "Recolhido" : "Baixado";
    document.getElementById("trem").textContent = tremPouso;
}

// Função para alterar o nível de combustível
function alterarCombustivel(valor) {
    combustivel = Math.max(0, Math.min(100, combustivel + valor));
    document.getElementById('combustivel').textContent = combustivel + '%';
}

// Função para calcular o consumo de combustível com base na distância
function calcularConsumoCombustivel(distancia) {
    const consumoPorKm = 0.005;  // 0,00005% de combustível consumido por km
    let consumo = distancia * consumoPorKm;
    combustivel = Math.max(0, combustivel - consumo);
    document.getElementById('combustivel').textContent = combustivel.toFixed(2) + '%';
}

// Função para calcular distância usando a fórmula de Haversine
function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371;  // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;  // Distância em km
}

// Função para calcular e traçar a rota, além de atualizar distância, tempo e combustível
function calcularDistancia() {
    const origem = document.getElementById('origem').value;
    const destino = document.getElementById('destino').value;

    if (origem === destino) {
        document.getElementById('distancia').textContent = "0 km";
        document.getElementById('tempo').textContent = "0 h";
        return;
    }

    const [latOrigem, lonOrigem] = coordenadas[origem];
    const [latDestino, lonDestino] = coordenadas[destino];

    const distancia = calcularDistanciaHaversine(latOrigem, lonOrigem, latDestino, lonDestino);
    document.getElementById('distancia').textContent = `${distancia.toFixed(2)} km`;

    const tempo = velocidade > 0 ? distancia / velocidade : 0;
    document.getElementById('tempo').textContent = `${tempo.toFixed(2)} h`;

    // Calcular o consumo de combustível com base na distância
    calcularConsumoCombustivel(distancia);

    // Verifica se a rota já existe no mapa e remove se necessário
    if (rota) {
        mapa.removeControl(rota);
    }

    // Adiciona a nova rota
    rota = L.Routing.control({
        waypoints: [
            L.latLng(latOrigem, lonOrigem),
            L.latLng(latDestino, lonDestino)
        ],
        routeWhileDragging: true
    }).addTo(mapa);

    // Ajuste de zoom para a rota
    mapa.fitBounds(rota.getBounds());
}


