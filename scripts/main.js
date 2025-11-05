document.addEventListener('DOMContentLoaded', () => {
    const masonryContainer = document.querySelector('.masonry-container');
    const modal = document.querySelector('.modal');
    const modalImage = document.querySelector('.modal-image');
    const modalText = document.querySelector('.modal-text');
    const closeBtn = document.querySelector('.close-btn');
    const defaultImgUrl = 'res/images/01.jpg';
    const placeHolderImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
    
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

        // 动态预加载数量：移动设备预加载3张，桌面预加载5张
        const isMobile = window.innerWidth < 768;
        const preloadCount = isMobile ? 3 : 5;
        preloadImages(cardsData, preloadCount);

        // 生成卡片并添加到容器
        cardsData.forEach((cardData) => {
            const card = createCard(cardData);
            masonryContainer.appendChild(card);
        });
        initLazyLoad()
    }

    //所有图片都设置懒加载,这里初始化懒加载观察器
    function initLazyLoad(){
        const options = {
            root: null, // 相对于视口
            rootMargin: '50px 0px', // 提前50px开始加载
            threshold: 0.1  // 当10%的卡片可见时触发
        };
        //通过这个交叉观察器来观察网页的卡片元素，到了观察范围内才加载真正的图片。
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    const card = entry.target;
                    const img = card.querySelector('.card-image');
                    const dataSrc = img.getAttribute('data-src');
                    if(dataSrc){
                        img.src = dataSrc;
                        //图片加载完后停止观察该卡片
                        img.removeAttribute('data-src');
                        observer.unobserve(card);
                    }
                }
            })
        }, options)

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => observer.observe(card));
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
        
        const imgUrl = cardItem.imageUrlWebP || cardItem.imageUrl || defaultImgUrl;
        
        const img = document.createElement('img');
        img.className = 'card-image';
        img.setAttribute('data-src', imgUrl);
        img.src = placeHolderImg;
        img.alt = '句子配图';
        
        // 设置加载样式，确保加载时有过渡效果
        img.style.opacity = '0';
        //设置过渡属性，透明度发生变化时，使用动画过渡
        img.style.transition = 'opacity 0.3s ease';
        
        // 图片加载完成后显示
        img.onload = function() {
            if(img.src != placeHolderImg){
                img.style.opacity = '1';
            }
        };
        
        // 加载失败时使用默认图片
        img.onerror = function() {
            if(img.getAttribute('data-src')){
                img.src = defaultImgUrl;
                img.style.opacity = '1';
            }
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
        const imgUrl = cardItem.imageUrlWebP || cardItem.imageUrl || defaultImgUrl;
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