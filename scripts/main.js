document.addEventListener('DOMContentLoaded', () => {
    const masonryContainer = document.querySelector('.masonry-container');
    const modal = document.querySelector('.modal');
    const modalImage = document.querySelector('.modal-image');
    const modalText = document.querySelector('.modal-text');
    const closeBtn = document.querySelector('.close-btn');

    // 图片资源路径
    const images = [
        'res/images/russian-aesthetics-01.jpg',
        'res/images/russian-aesthetics-02.jpg',
        'res/images/russian-aesthetics-03.jpg',
        'res/images/russian-aesthetics-04.jpg',
        'res/images/russian-aesthetics-05.jpg',
        'res/images/russian-aesthetics-06.jpg',
        'res/images/russian-aesthetics-07.jpg',
        'res/images/russian-aesthetics-08.jpg',
        'res/images/russian-aesthetics-09.jpg',
        'res/images/russian-aesthetics-10.jpg',
        'res/images/russian-aesthetics-11.jpg',
        'res/images/russian-aesthetics-12.jpg',
        'res/images/russian-aesthetics-13.jpg',
        'res/images/scent-of-a-woman.jpg'
    ];

    // 加载并解析诗歌文件
    async function loadPoems() {
        try {
            const personalResponse = await fetch('res/poems/poems-personal-collection.txt');
            const russiaResponse = await fetch('res/poems/poems-russia.txt');
            const personalText = await personalResponse.text();
            const russiaText = await russiaResponse.text();

            // 合并并解析句子（按空行分割）
            const allText = personalText + '\n\n' + russiaText;
            const sentences = allText.split(/\n\s*\n/)
                .map(s => s.trim())
                .filter(s => s.length > 0);

            return sentences;
        } catch (error) {
            console.error('加载诗歌失败:', error);
            return [];
        }
    }

    // 创建卡片
    function createCard(sentence, imageSrc) {
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.className = 'card-image';
        img.src = imageSrc;
        img.alt = '句子配图';

        const text = document.createElement('p');
        text.className = 'card-text';
        text.textContent = sentence;

        card.appendChild(img);
        card.appendChild(text);

        // 点击卡片打开模态框
        card.addEventListener('click', () => {
            modalImage.src = imageSrc;
            modalText.textContent = sentence;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滚动
        });

        return card;
    }

    // 初始化页面
    async function init() {
        const sentences = await loadPoems();
        if (sentences.length === 0) return;

        // 生成卡片并添加到容器
        sentences.forEach((sentence, index) => {
            const imageIndex = index % images.length;
            const card = createCard(sentence, images[imageIndex]);
            masonryContainer.appendChild(card);
        });
    }

    // 关闭模态框
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // 恢复背景滚动
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

    // 启动初始化
    init();
})