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
        
        // 检查并预加载即将可见的图片
        checkImagesVisibility();
        
        // 监听滚动和窗口调整事件
        window.addEventListener('scroll', checkImagesVisibility);
        window.addEventListener('resize', checkImagesVisibility);
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
        
        // 存储图片URL在data属性中用于延迟加载
        const imgUrl = cardItem.imageUrl || defaultImgUrl;
        
        const img = document.createElement('img');
        img.className = 'card-image';
        // 设置默认占位图，只占用极小空间，是一张极小的、内嵌在代码中的SVG图片
        //相当于<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        img.dataset.src = imgUrl; // 存储真实URL在data-src中
        img.alt = '句子配图';
        
        // 设置加载中样式
        img.style.opacity = '0';
        //设置过渡属性，透明度发生变化时，使用动画过渡
        img.style.transition = 'opacity 0.3s ease';

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

    //寻找未加载的图片，在它们进入视口时进行加载
    function checkImagesVisibility() {
        //查找页面上所有带有card-image类选择器并且拥有data-src属性的图片元素
        const images = document.querySelectorAll('.card-image[data-src]');
        
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            /** 当图片进入或即将进入视口时加载
             *  ┌─────────────────────────────────────────┐
                │        提前300px开始加载 (缓冲區)          │  ← rect.top < window.innerHeight + 300
                ├─────────────────────────────────────────┤ ← 浏览器窗口底部 (window.innerHeight)
                │                                         │
                │            可视区域                      │
                │                                         │
                ├─────────────────────────────────────────┤ ← 浏览器窗口顶部 (0)
                │        提前300px开始加载 (缓冲區)          │  ← rect.bottom > -300
                └─────────────────────────────────────────┘
             */
            if (rect.top < window.innerHeight + 300 && rect.bottom > -300) {
                //用临时的tempImg对图片进行预加载
                const tempImg = new Image();
                //加载成功后将图片资源显示到对应的img上
                tempImg.onload = function() {
                    img.src = img.dataset.src;
                    img.style.opacity = '1'; // img透明度变化会有动效，这里触发
                    img.removeAttribute('data-src'); // 移除数据属性避免重复处理
                };
                // 加载失败时使用默认图片
                tempImg.onerror = function() {
                    img.src = defaultImgUrl;
                    img.style.opacity = '1';
                    img.removeAttribute('data-src');
                };
                //预加载触发在这里
                tempImg.src = img.dataset.src;
            }
        });
        
        // 当所有图片都加载完后移除事件监听
        if (document.querySelectorAll('.card-image[data-src]').length === 0) {
            window.removeEventListener('scroll', checkImagesVisibility);
            window.removeEventListener('resize', checkImagesVisibility);
        }
    }
    
    //关闭大号卡片
    function closeModal(){  
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }

})