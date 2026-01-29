//==== MINHAS FUNÇÕES=======//

function calcularConsumoMedio(compras) {
    if (!compras || compras.length < 2) return null; // pouco histórico

    let totalDias = 0;
    let totalComprado = 0;

    for (let i = 1; i < compras.length; i++) {
        const dias = (new Date(compras[i].data_compra) - new Date(compras[i - 1].data_compra)) / (1000 * 60 * 60 * 24);
        totalDias += dias;
        totalComprado += compras[i].quantidade_comprada;
    }

    if (totalDias === 0) return null;

    return totalComprado / totalDias; // consumo médio por dia
}

function preverFimEstoque(quantidadeAtual, consumoMedio) {
    if (!consumoMedio || consumoMedio <= 0) return "Sem previsão";
    const diasRestantes = quantidadeAtual / consumoMedio;
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + diasRestantes);
    return dataFim.toLocaleDateString("pt-BR");
}


// ===== Theme Toggle =====
function initTheme() {
    const savedTheme = localStorage.getItem('daynight-theme');
    if (savedTheme === 'carbon') {
        document.documentElement.classList.add('carbon');
        document.body.classList.add('carbon');
        updateThemeButtons('carbon');
    } else {
        updateThemeButtons('snow');
    }
}

function setTheme(theme) {
    if (theme === 'carbon') {
        document.documentElement.classList.add('carbon');
        document.body.classList.add('carbon');
        localStorage.setItem('daynight-theme', 'carbon');
    } else {
        document.documentElement.classList.remove('carbon');
        document.body.classList.remove('carbon');
        localStorage.setItem('daynight-theme', 'snow');
    }
    updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
    const snowBtns = document.querySelectorAll('.theme-btn-snow');
    const carbonBtns = document.querySelectorAll('.theme-btn-carbon');

    snowBtns.forEach(btn => {
        btn.classList.toggle('active', theme === 'snow');
    });
    carbonBtns.forEach(btn => {
        btn.classList.toggle('active', theme === 'carbon');
    });
}


// ===== Date Range Picker =====
function setDateRange(range, btn) {
    const btns = document.querySelectorAll('.date-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update charts based on range
    updateCharts(range);
}

function updateCharts(range) {
    // Animate chart bars based on selected range
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        const currentHeight = parseInt(bar.style.height);
        let multiplier = 1;

        if (range === '7d') multiplier = 0.7;
        if (range === '30d') multiplier = 1;
        if (range === '90d') multiplier = 1.2;
        if (range === '12m') multiplier = 1.4;

        // Random variation
        const variation = 0.8 + Math.random() * 0.4;
        bar.style.height = (currentHeight * multiplier * variation) + 'px';
    });
}

// ===== Inbox =====
function selectMessage(el, index) {
    // Remove active from all
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active to selected
    el.classList.add('active');
    el.classList.remove('unread');

    // Update message view
    updateMessageView(index);
}

function updateMessageView(index) {
    const messages = [
        {
            subject: 'Project Update: Q1 Dashboard Redesign',
            sender: 'Sarah Chen',
            email: 'sarah.chen@company.com',
            date: 'Jan 2, 2026 at 9:45 AM',
            body: `<p>Hi Alex,</p>
                   <p>I wanted to give you a quick update on the Q1 dashboard redesign project. We've completed the wireframes and initial mockups, and the team is ready to move into the development phase.</p>
                   <p>Key highlights from our progress:</p>
                   <p>• User research completed with 15 participants<br>
                   • 3 design concepts presented to stakeholders<br>
                   • Final direction approved by leadership<br>
                   • Development sprint starting next Monday</p>
                   <p>Could we schedule a quick sync tomorrow to go over the technical requirements? Let me know what time works best for you.</p>
                   <p>Best regards,<br>Sarah</p>`
        },
        {
            subject: 'Weekly Analytics Report',
            sender: 'Analytics Bot',
            email: 'analytics@company.com',
            date: 'Jan 1, 2026 at 8:00 AM',
            body: `<p>Hello Alex,</p>
                   <p>Here's your weekly analytics summary for December 25-31, 2025:</p>
                   <p><strong>Traffic Overview:</strong><br>
                   Total visitors: 45,230 (+12% vs last week)<br>
                   Page views: 128,450 (+8%)<br>
                   Avg. session duration: 4m 32s</p>
                   <p><strong>Top Performing Pages:</strong><br>
                   1. /dashboard - 15,230 views<br>
                   2. /analytics - 8,450 views<br>
                   3. /projects - 6,780 views</p>
                   <p>View the full report in your Analytics dashboard.</p>`
        },
        {
            subject: 'New Team Member Introduction',
            sender: 'HR Team',
            email: 'hr@company.com',
            date: 'Dec 31, 2025 at 2:30 PM',
            body: `<p>Dear Team,</p>
                   <p>We're excited to announce that Michael Torres will be joining our engineering team starting January 6th as a Senior Frontend Developer.</p>
                   <p>Michael comes to us with 8 years of experience in web development and has previously worked at several notable tech companies. He'll be working closely with the product team on our new features.</p>
                   <p>Please join us in welcoming Michael to the team!</p>
                   <p>Best,<br>HR Team</p>`
        }
    ];

    const msg = messages[index] || messages[0];

    document.querySelector('.message-view-subject').textContent = msg.subject;
    document.querySelector('.message-view-sender-name').textContent = msg.sender;
    document.querySelector('.message-view-sender-email').textContent = msg.email;
    document.querySelector('.message-view-date').textContent = msg.date;
    document.querySelector('.message-view-body').innerHTML = msg.body;
}

// ===== Kanban =====
function initKanban() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-cards');

    cards.forEach(card => {
        card.setAttribute('draggable', true);

        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            column.appendChild(dragging);
        });
    });
}

// ===== Settings Toggles =====
function initToggles() {
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function () {
            console.log(`${this.id} is now ${this.checked ? 'enabled' : 'disabled'}`);
        });
    });
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menu && overlay) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menu && overlay) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    setGreeting();

    if (document.querySelector('.kanban-board')) {
        initKanban();
    }

    if (document.querySelector('.toggle')) {
        initToggles();
    }

    // Close mobile menu on overlay click
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
});


function toggleView(isResolver) {
    const slider = document.getElementById('main-view-slider');
    if (isResolver) {
        slider.style.transform = 'translateX(-50%)';
    } else {
        slider.style.transform = 'translateX(0%)';
    }
}

function changeQty(btn, delta) {
    const span = btn.parentElement.querySelector('.qty-val');
    let current = parseInt(span.innerText);
    if (current + delta >= 0) {
        span.innerText = current + delta;
    }
}

function gerenciarNavegacao() {
    const slider = document.getElementById('main-view-slider');
    const sideResolver = document.getElementById('side-resolver');
    const sideInventario = document.getElementById('side-inventario');
    const sideScan = document.getElementById('side-scan'); // Novo painel Scan
    const navLinks = document.querySelectorAll('.nav-link');

    // 1. Função principal para trocar de tela
    window.irParaPainel = function(destino) {
        // Resetamos a visibilidade de TODOS os painéis extras antes de mover
        if (sideResolver) sideResolver.style.display = 'none';
        if (sideInventario) sideInventario.style.display = 'none';
        if (sideScan) sideScan.style.display = 'none';

        if (destino === 'controle') {
            // Volta para o Dashboard (0%)
            slider.style.transform = 'translateX(0%)';
            atualizarLinkAtivo('/');
        } 
        else {
            // Define qual painel será exibido na direita
            if (destino === 'resolver' && sideResolver) {
                sideResolver.style.display = 'block';
                atualizarLinkAtivo('resolver');
            } 
            else if (destino === 'inventario' && sideInventario) {
                sideInventario.style.display = 'block';
                atualizarLinkAtivo('inventario');
            }
            else if (destino === 'scan' && sideScan) {
                sideScan.style.display = 'block';
                atualizarLinkAtivo('scan'); // Certifique-se que o link do Scan tenha "scan" no nome/href
            }

            // Move o slider para a 2ª metade (Independente de qual painel abriu)
            slider.style.transform = 'translateX(-50%)';
        }
    };

    // 2. Função para destacar o botão correto na sidebar
    function atualizarLinkAtivo(hrefOuTipo) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && (href.includes(hrefOuTipo) || (hrefOuTipo === '/' && href === '/'))) {
                link.classList.add('active');
            }
        });
    }

    // 3. Captura cliques no link "Painel de Controle"
    const linkHome = document.querySelector('a[href="/"]');
    if (linkHome) {
        linkHome.addEventListener('click', function(e) {
            e.preventDefault();
            irParaPainel('controle');
        });
    }

    // 4. Captura clique no "Listo Scan" (Caso você use a classe .nav-upgrade que está no seu HTML)
    const linkScan = document.querySelector('.nav-upgrade');
    if (linkScan) {
        linkScan.addEventListener('click', function(e) {
            e.preventDefault();
            irParaPainel('scan');
        });
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', gerenciarNavegacao);

/**
 * Funções de atalho para os onclicks do seu HTML
 */
function gerenciarPaineis(tipo) {
    if(window.irParaPainel) window.irParaPainel(tipo);
}

// Funções de compatibilidade para os botões "Sair"
function toggleView(show) { if(!show) window.irParaPainel('controle'); }
function toggleInventoryView(show) { if(!show) window.irParaPainel('controle'); }
function toggleScanView(show) { if(!show) window.irParaPainel('controle'); }



let slideScanAtual = 0;
const totalSlidesScan = 8;

function moverSliderInterno(direcao) {
    const slider = document.getElementById('inner-category-slider');
    if (!slider) return;

    slideScanAtual += direcao;

    // Limites
    if (slideScanAtual < 0) slideScanAtual = 0;
    if (slideScanAtual >= totalSlidesScan) slideScanAtual = totalSlidesScan - 1;

    // O pulo é de 12.5% (1/8 de 800%)
    const deslocamento = slideScanAtual * 12.5;
    slider.style.transform = `translateX(-${deslocamento}%)`;
    
    atualizarDotsScan();
}

function atualizarDotsScan() {
    const dotsContainer = document.getElementById('dots-indicador');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlidesScan; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            width: ${i === slideScanAtual ? '12px' : '6px'};
            height: 6px;
            border-radius: 3px;
            background: ${i === slideScanAtual ? 'var(--primary)' : 'rgba(0,0,0,0.2)'};
            transition: all 0.3s ease;
        `;
        dotsContainer.appendChild(dot);
    }
}

// Chame a função ao carregar a página ou abrir o painel
document.addEventListener('DOMContentLoaded', atualizarDotsScan);


// Objeto para rastrear o estado de cada um dos 4 tinders
const tinderStates = {
    cozinha: { current: 0, total: 0 },
    higiene: { current: 0, total: 0 },
    limpeza: { current: 0, total: 0 },
    geral: { current: 0, total: 0 }
};

function moveTinder(tinderId, direction) {
    const card = document.getElementById(`tinder-${tinderId}`);
    const track = card.querySelector('.tinder-track');
    const counter = card.querySelector('.tinder-counter');
    
    // Pega o total de itens (calculado pela largura do track / 100)
    const totalItems = track.querySelectorAll('.tinder-item').length;
    tinderStates[tinderId].total = totalItems;

    let nextSlide = tinderStates[tinderId].current + direction;

    // Bloqueia limites
    if (nextSlide >= 0 && nextSlide < totalItems) {
        tinderStates[tinderId].current = nextSlide;
        const offset = nextSlide * (100 / totalItems);
        track.style.transform = `translateX(-${offset}%)`;
        
        // Atualiza contador
        counter.innerText = `${nextSlide + 1} / ${totalItems}`;
    }
}

function updateTinderQty(itemId, change) {
    const span = document.getElementById(`val-${itemId}`);
    const bar = document.getElementById(`bar-${itemId}`);
    
    if (!span || !bar) return;

    let currentVal = parseInt(span.innerText);
    const idealVal = parseFloat(bar.getAttribute('data-ideal')) || 1; // Evita divisão por zero

    // Atualiza valor numérico
    currentVal = Math.max(0, currentVal + change);
    span.innerText = currentVal;

    // Atualiza Barra de Progresso (Capado em 100% para não explodir o layout)
    let percent = (currentVal / idealVal) * 100;
    bar.style.width = Math.min(100, percent) + '%';

    // Feedback visual de cor se estiver acabando
    if (percent <= 15) {
        bar.style.filter = 'hue-rotate(-40deg) saturate(1.5)'; // Fica mais avermelhado
    } else {
        bar.style.filter = 'none';
    }
}

function salvarTudo() {
    // Aqui você coleta todos os valores dos spans que começam com "val-"
    // e envia via fetch para sua rota de atualização.
    console.log("Salvando todas as revisões...");
}