document.addEventListener('DOMContentLoaded', () => {
    const masonryContainer = document.querySelector('.masonry-container');
    const modal = document.querySelector('.modal');
    const modalImage = document.querySelector('.modal-image');
    const modalText = document.querySelector('.modal-text');
    const closeBtn = document.querySelector('.close-btn');
    const defaultImgUrl = 'res/images/01.jpg';
    
    // 预加载指定数量的图片
    function preloadImages(imagesToLoad, count = 5) {
        const preloadCount = Math.min(count, imagesToLoad.length);
        for (let i = 0; i < preloadCount; i++) {
            const imgUrl = imagesToLoad[i].imageUrl || defaultImgUrl;
            if (imgUrl) {
                const img = new Image();
                //当你给 Image对象的 src属性赋值一个URL时，浏览器会立即开始发起网络请求来获取该图片资源。
                // 一旦下载完成，这张图片就会被存储在浏览器的缓存中，后续使用无需再次请求网络
                img.src = imgUrl;
            }
        }
    }

    // 启动初始化
    init();

    //初始化页面
    async function init() {
        const cardsData = await loadCardsData();
        if (cardsData.length === 0) return;

        // 预加载前5张图片
        preloadImages(cardsData);

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

    // 创建卡片UI项
    function createCard(cardItem) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        const imgUrl = cardItem.imageUrl || defaultImgUrl;
        
        const img = document.createElement('img');
        img.className = 'card-image';
        img.src = imgUrl;
        img.alt = '句子配图';
        
        // 设置加载样式，确保加载时有过渡效果
        img.style.opacity = '0';
        //设置过渡属性，透明度发生变化时，使用动画过渡
        img.style.transition = 'opacity 0.3s ease';
        
        // 图片加载完成后显示
        img.onload = function() {
            img.style.opacity = '1';
        };
        
        // 加载失败时使用默认图片
        img.onerror = function() {
            img.src = defaultImgUrl;
            img.style.opacity = '1';
        };

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
        // 清空之前的图片，显示加载中状态
        modalImage.style.opacity = '0';
        modalImage.src = '';
        modalText.textContent = cardItem.sentences;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 确保图片加载完成后再显示
        const imgUrl = cardItem.imageUrl || defaultImgUrl;
        const tempImg = new Image();
        tempImg.onload = function() {
            modalImage.src = imgUrl;
            // 延迟设置opacity以确保图片已完全替换
            setTimeout(() => {
                modalImage.style.opacity = '1';
            }, 50);
        };
        tempImg.onerror = function() {
            modalImage.src = defaultImgUrl;
            setTimeout(() => {
                modalImage.style.opacity = '1';
            }, 50);
        };
        tempImg.src = imgUrl;
    }

    // 简化的图片加载检查函数，确保在移动设备上兼容
    function checkImagesVisibility() {
        // 由于现在直接加载图片，这个函数可以保持简单或移除
        // 保留是为了兼容现有代码结构
        return;
    }
    
    //关闭大号卡片
    function closeModal(){  
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }

})