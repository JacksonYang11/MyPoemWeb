document.addEventListener('DOMContentLoaded', () => {
    const masonryContainer = document.querySelector('.masonry-container');
    const modal = document.querySelector('.modal');
    const modalImage = document.querySelector('.modal-image');
    const modalText = document.querySelector('.modal-text');
    const closeBtn = document.querySelector('.close-btn');
    const defaultImgUrl = 'res/images/01.jpg';

    // 启动初始化
    init();

    //初始化页面
    async function init() {
        const cardsData = await loadCardsData();
        if (cardsData.length === 0) return;

        // 生成卡片并添加到容器
        cardsData.forEach((cardData) => {
            const card = createCard(cardData);
            masonryContainer.appendChild(card);
        });
    }

    // 事件监听
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    //直接从json文件中加载卡片数据
    async function loadCardsData(){
        try{
            const response = await fetch('res/poems/poems.json');
            const cards = await response.json();
            return cards;
        } catch(error){
            console.error('加载卡片数据失败', error);
            return [];
        }
    }

    //创建卡片UI项
    function createCard(cardItem){
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        const img = document.createElement('img');
        img.className = 'card-image';
        img.src = cardItem.imageUrl || defaultImgUrl;
        img.alt = '句子配图';

        const text = document.createElement('p');
        text.className = 'card-text';
        text.textContent = cardItem.sentences;

        cardElement.appendChild(img);
        cardElement.appendChild(text);

        cardElement.addEventListener('click', () => {
            openModal(cardItem);
        });
        return cardElement;
    }

    //打开大号卡片
    function openModal(cardItem){
        modalImage.src = cardItem.imageUrl || defaultImgUrl;
        modalText.textContent = cardItem.sentences;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    //关闭大号卡片
    function closeModal(){
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }

})