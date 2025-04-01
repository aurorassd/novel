document.addEventListener('DOMContentLoaded', () => {
    const MAX_NOVELS = 10;
    const STORAGE_KEY = 'aiNovelAssistantData_v1';

    // --- DOM Elements ---
    const menuButton = document.getElementById('menu-button');
    const novelMenu = document.getElementById('novel-menu');
    const novelListElement = document.getElementById('novel-list');
    const createNewNovelButton = document.getElementById('create-new-novel-button');
    const novelListMainSection = document.getElementById('novel-list-main');
    const mainNovelListUl = document.getElementById('main-novel-list-ul');
    const noNovelsMessage = document.getElementById('no-novels-message');
    const novelDetailsElement = document.getElementById('novel-details');
    const novelTitleInput = document.getElementById('novel-title');
    const novelSettingTextarea = document.getElementById('novel-setting');
    const novelCharactersTextarea = document.getElementById('novel-characters');
    const combinedNovelPromptTextarea = document.getElementById('combined-novel-prompt');
    const copyCombinedNovelPromptButton = document.getElementById('copy-combined-novel-prompt');
    const deleteNovelButton = document.getElementById('delete-novel-button');
    const addSubtitleButton = document.getElementById('add-subtitle-button'); // この要素自体は変更なし
    const subtitleListContainer = document.getElementById('subtitle-list');
    const subtitleTemplate = document.getElementById('subtitle-template');

    // --- Application State ---
    let novels = [];
    let currentNovelIndex = null;

    // --- Initialization ---
    loadData();
    renderNovelList();
    setupInitialView();
    addGlobalEventListeners();

    // --- Data Handling (変更なし) ---
    function saveData() { /* ... */ }
    function loadData() { /* ... */ }

    // --- UI Rendering ---
    function renderNovelList() { /* ... サイドメニューリスト (変更なし) ... */ }
    function renderMainNovelList() { /* ... メインエリアリスト (変更なし) ... */ }

    // ▼▼▼ 修正: 初期表示と表示切り替え ▼▼▼
    function setupInitialView() {
        if (currentNovelIndex !== null && novels[currentNovelIndex]) {
            // 特定の小説が選択されている場合 -> 詳細表示
            novelListMainSection.classList.add('hidden'); // トップリスト非表示
            addSubtitleButton.style.display = 'block';    // ★★★ サブタイトル追加ボタン表示 ★★★
            renderNovelDetails(currentNovelIndex);        // 詳細レンダリング (ここで novelDetailsElement が表示される)
        } else {
            // 小説が選択されていない場合 -> トップリスト表示
            novelDetailsElement.classList.add('hidden');   // 詳細非表示
            addSubtitleButton.style.display = 'none';     // ★★★ サブタイトル追加ボタン非表示 ★★★
            renderMainNovelList(); // メインリストをレンダリング・表示
        }
        closeMenu(); // メニューは常に閉じる
    }
    // ▲▲▲ 修正 ▲▲▲

    function renderNovelDetails(index) {
        if (index < 0 || index >= novels.length) {
             console.error("Invalid novel index:", index);
             currentNovelIndex = null;
             setupInitialView(); // 不正ならトップ表示に戻す
             return;
        }
        currentNovelIndex = index;
        const novel = novels[index];

        // 表示切り替え (setupInitialView で実施済みだが念のため)
        novelListMainSection.classList.add('hidden');
        novelDetailsElement.classList.remove('hidden');
        addSubtitleButton.style.display = 'block'; // 詳細表示時は必ず表示

        // 詳細内容の設定 (変更なし)
        novelTitleInput.value = novel.title || '';
        novelSettingTextarea.value = novel.setting || '';
        novelCharactersTextarea.value = novel.characters || '';
        updateCombinedNovelPrompt();
        subtitleListContainer.innerHTML = '';
        if (novel.subtitles && Array.isArray(novel.subtitles)) {
             novel.subtitles.forEach((subtitle, subtitleIndex) => {
                addSubtitleElement(subtitle, subtitleIndex);
            });
        } else {
            novel.subtitles = [];
        }
        renderNovelList(); // サイドメニューのアクティブ表示更新
    }

    function addSubtitleElement(subtitleData, subtitleIndex) {
        // サブタイトル要素作成・設定 (変更なし)
        const templateClone = subtitleTemplate.content.cloneNode(true);
        const subtitleEntry = templateClone.querySelector('.subtitle-entry');
        subtitleEntry.dataset.subtitleIndex = subtitleIndex;
        const toggleButton = subtitleEntry.querySelector('.toggle-button');
        const subtitleInput = subtitleEntry.querySelector('.subtitle-input');
        const episodeSelect = subtitleEntry.querySelector('.episode-select');
        const lengthSelect = subtitleEntry.querySelector('.length-select');
        const tone1Select = subtitleEntry.querySelector('.tone1-select');
        const tone2Select = subtitleEntry.querySelector('.tone2-select');
        const tone3Select = subtitleEntry.querySelector('.tone3-select');
        const plotTextarea = subtitleEntry.querySelector('.plot-textarea');
        const notesTextarea = subtitleEntry.querySelector('.notes-textarea');
        const promptOutput = subtitleEntry.querySelector('.subtitle-prompt-output');
        const copyPromptButton = subtitleEntry.querySelector('.copy-subtitle-prompt-button');
        const deleteButton = subtitleEntry.querySelector('.delete-subtitle-button');

        subtitleInput.value = subtitleData.subtitle || '';
        lengthSelect.value = subtitleData.length || '中尺';
        tone1Select.value = subtitleData.tone1 || 'なし';
        tone2Select.value = subtitleData.tone2 || 'なし';
        tone3Select.value = subtitleData.tone3 || 'なし';
        plotTextarea.value = subtitleData.plot || '';
        notesTextarea.value = subtitleData.notes || '';

        // ★★★ 話数プルダウン生成関数を呼び出す ★★★
        populateEpisodeSelect(episodeSelect, subtitleData.episode); // totalSubtitles は不要に

        updateSubtitleToggleButtonText(toggleButton, subtitleData.subtitle, subtitleData.episode);

        // イベントリスナー設定 (変更なし)
        [subtitleInput, episodeSelect, lengthSelect, tone1Select, tone2Select, tone3Select, plotTextarea, notesTextarea].forEach(element => { /* ... */ });
        copyPromptButton.addEventListener('click', () => { /* ... */ });
        deleteButton.addEventListener('click', () => { /* ... */ });
        addCollapsibleFunctionality(subtitleEntry);
        updateSubtitlePromptOutput(subtitleEntry, subtitleIndex);
        subtitleListContainer.appendChild(subtitleEntry);
    }


    // ▼▼▼ 修正: 話数プルダウン生成関数 ▼▼▼
    function populateEpisodeSelect(selectElement, selectedEpisode) {
        selectElement.innerHTML = ''; // クリア
        const maxEpisodes = 99; // ★★★ 最大99話に固定 ★★★
        for (let i = 1; i <= maxEpisodes; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}話`;
            selectElement.appendChild(option);
        }
        // 保存された話数が1-99の範囲内ならそれを選択、そうでなければ1を選択
        selectElement.value = (selectedEpisode >= 1 && selectedEpisode <= maxEpisodes) ? selectedEpisode : 1;
    }
    // ▲▲▲ 修正 ▲▲▲


    // --- Event Handlers ---
    function handleMenuToggle() { /* ... (変更なし) ... */ }
    function closeMenu() { /* ... (変更なし) ... */ }
    function handleCreateNewNovel() { /* ... (変更なし、作成後は詳細表示->setupInitialViewでボタン表示) ... */ }
    function handleDeleteNovel() { /* ... (変更なし、削除後はトップ表示->setupInitialViewでボタン非表示) ... */ }
    function switchNovel(index) { /* ... (変更なし、切り替え->setupInitialViewで表示更新) ... */ }
    function handleNovelInputChange(event) { /* ... (変更なし) ... */ }
    function handleAddSubtitle() { /* ... (変更なし) ... */ }
    function handleSubtitleInputChange(event) { /* ... (変更なし) ... */ }
    function deleteSubtitle(subtitleIndex) { /* ... (変更なし) ... */ }

    // --- Prompt Generation (変更なし) ---
    function generateCombinedNovelPrompt(novel) { /* ... */ }
    function generateSubtitlePrompt(subtitle) { /* ... */ }
    function updateCombinedNovelPrompt() { /* ... */ }
    function updateSubtitlePromptOutput(subtitleElement, subtitleIndex) { /* ... */ }
    function updateSubtitleToggleButtonText(button, subtitleText, episode) { /* ... */ }

    // --- Utility Functions (変更なし) ---
    function copyToClipboard(text, buttonElement = null) { /* ... */ }
    async function pasteFromClipboard(targetElement) { /* ... */ }
    function addCollapsibleFunctionality(sectionElement) { /* ... */ }
    function openCollapsible(sectionElement) { /* ... */ }

    // --- Global Event Listeners Setup (変更なし) ---
    function addGlobalEventListeners() { /* ... */ }

    // --- Utility Functions 実装 (変更なし) ---
    // (generateCombinedNovelPrompt, generateSubtitlePrompt, updateCombinedNovelPrompt, ... pasteFromClipboard, addCollapsibleFunctionality, openCollapsible の実装は前の回答と同じ)


    // --- 再掲: 変更のなかった関数や省略した部分を含む完全なコード ---

    // Data Handling
    function saveData() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(novels)); }
        catch (e) { console.error("Error saving data:", e); alert("データ保存失敗"); }
    }
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            try { novels = JSON.parse(data); if (!Array.isArray(novels)) novels = []; }
            catch (e) { console.error("Error parsing data:", e); novels = []; alert("データ読込失敗"); localStorage.removeItem(STORAGE_KEY); }
        } else { novels = []; }
        if (novels.length > MAX_NOVELS) { novels = novels.slice(0, MAX_NOVELS); saveData(); }
    }

    // UI Rendering (サイドメニュー)
    function renderNovelList() {
        novelListElement.innerHTML = '';
        if (novels.length === 0) { novelListElement.innerHTML = '<li>まだ小説がありません</li>'; }
        else {
            novels.forEach((novel, index) => {
                const li = document.createElement('li');
                li.textContent = novel.title || `無題 ${index + 1}`;
                li.dataset.index = index;
                if (index === currentNovelIndex) li.classList.add('active');
                li.addEventListener('click', () => { switchNovel(index); closeMenu(); });
                novelListElement.appendChild(li);
            });
        }
        createNewNovelButton.disabled = novels.length >= MAX_NOVELS;
        createNewNovelButton.title = novels.length >= MAX_NOVELS ? `最大${MAX_NOVELS}件` : '新規作成';
    }
    // UI Rendering (メインリスト)
    function renderMainNovelList() {
        mainNovelListUl.innerHTML = '';
        if (novels.length > 0) {
            novelListMainSection.classList.remove('hidden');
            noNovelsMessage.classList.add('hidden');
            mainNovelListUl.classList.remove('hidden');
            novels.forEach((novel, index) => {
                const li = document.createElement('li');
                li.textContent = novel.title || `無題 ${index + 1}`;
                li.dataset.index = index;
                li.addEventListener('click', () => switchNovel(index));
                mainNovelListUl.appendChild(li);
            });
        } else {
            novelListMainSection.classList.remove('hidden');
            mainNovelListUl.classList.add('hidden');
            noNovelsMessage.classList.remove('hidden');
        }
    }
    // UI Rendering (サブタイトル要素詳細) - イベントリスナー部分
     [subtitleInput, episodeSelect, lengthSelect, tone1Select, tone2Select, tone3Select, plotTextarea, notesTextarea].forEach(element => {
        element.addEventListener('change', handleSubtitleInputChange);
        if(element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.addEventListener('input', handleSubtitleInputChange);
        }
    });
    copyPromptButton.addEventListener('click', () => copyToClipboard(promptOutput.value, copyPromptButton));
    deleteButton.addEventListener('click', () => {
        if (confirm(`「${subtitleData.subtitle || '無題'}」(第${subtitleData.episode}話) を削除しますか？`)) {
            deleteSubtitle(subtitleIndex);
        }
    });


    // Event Handlers
    function handleMenuToggle() { novelMenu.classList.toggle('visible'); }
    function closeMenu() { novelMenu.classList.remove('visible'); }
    function handleCreateNewNovel() {
        if (novels.length >= MAX_NOVELS) { alert(`最大${MAX_NOVELS}件`); return; }
        const newNovel = { title: `新規 ${novels.length + 1}`, setting: '', characters: '', subtitles: [] };
        novels.push(newNovel);
        currentNovelIndex = novels.length - 1;
        saveData();
        renderNovelList();
        setupInitialView(); // 詳細表示に切り替える
        novelTitleInput.focus();
        openCollapsible(document.querySelector('#novel-setup .collapsible-section:nth-child(1)'));
        openCollapsible(document.querySelector('#novel-setup .collapsible-section:nth-child(2)'));
        openCollapsible(document.querySelector('#novel-setup .collapsible-section:nth-child(3)'));
    }
    function handleDeleteNovel() {
        if (currentNovelIndex === null || !novels[currentNovelIndex]) return;
        const title = novels[currentNovelIndex].title || `無題 ${currentNovelIndex + 1}`;
        if (confirm(`「${title}」を削除しますか？`)) {
            novels.splice(currentNovelIndex, 1);
            currentNovelIndex = null;
            saveData();
            renderNovelList();
            setupInitialView(); // トップ表示に戻す
        }
    }
    function switchNovel(index) {
        if (index >= 0 && index < novels.length) { currentNovelIndex = index; }
        else { console.error("Invalid index:", index); currentNovelIndex = null; }
        setupInitialView(); // 表示更新
        closeMenu();
    }
    function handleNovelInputChange(event) {
        if (currentNovelIndex === null) return;
        const novel = novels[currentNovelIndex]; const { id, value } = event.target;
        if (id === 'novel-title') { novel.title = value; renderNovelList(); }
        else if (id === 'novel-setting') novel.setting = value;
        else if (id === 'novel-characters') novel.characters = value;
        updateCombinedNovelPrompt(); saveData();
    }
    function handleAddSubtitle() {
        if (currentNovelIndex === null) return;
        const novel = novels[currentNovelIndex];
        const nextEpisode = novel.subtitles.length + 1;
        const newSubtitle = { subtitle: '', episode: nextEpisode, length: '中尺', tone1: 'なし', tone2: 'なし', tone3: 'なし', plot: '', notes: '' };
        novel.subtitles.push(newSubtitle);
        addSubtitleElement(newSubtitle, novel.subtitles.length - 1);
        saveData();
        const newElement = subtitleListContainer.lastElementChild;
        if (newElement) { newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); openCollapsible(newElement); }
    }
    function handleSubtitleInputChange(event) {
        if (currentNovelIndex === null) return;
        const target = event.target; const entry = target.closest('.subtitle-entry'); if (!entry) return;
        const index = parseInt(entry.dataset.subtitleIndex, 10); if (isNaN(index) || !novels[currentNovelIndex].subtitles[index]) return;
        const subtitle = novels[currentNovelIndex].subtitles[index]; const { value } = target;
        const toggleBtn = entry.querySelector('.toggle-button');
        if (target.classList.contains('subtitle-input')) { subtitle.subtitle = value; updateSubtitleToggleButtonText(toggleBtn, value, subtitle.episode); }
        else if (target.classList.contains('episode-select')) { subtitle.episode = parseInt(value, 10); updateSubtitleToggleButtonText(toggleBtn, subtitle.subtitle, subtitle.episode); }
        else if (target.classList.contains('length-select')) subtitle.length = value;
        else if (target.classList.contains('tone1-select')) subtitle.tone1 = value;
        else if (target.classList.contains('tone2-select')) subtitle.tone2 = value;
        else if (target.classList.contains('tone3-select')) subtitle.tone3 = value;
        else if (target.classList.contains('plot-textarea')) subtitle.plot = value;
        else if (target.classList.contains('notes-textarea')) subtitle.notes = value;
        updateSubtitlePromptOutput(entry, index); saveData();
    }
    function deleteSubtitle(subtitleIndex) {
        if (currentNovelIndex === null) return; const novel = novels[currentNovelIndex];
        if (subtitleIndex < 0 || subtitleIndex >= novel.subtitles.length) return;
        novel.subtitles.splice(subtitleIndex, 1); saveData(); renderNovelDetails(currentNovelIndex);
    }

    // Prompt Generation
    function generateCombinedNovelPrompt(novel) { return `\n# タイトル\n${novel.title || '（未設定）'}\n\n# 舞台設定\n${novel.setting || '（未設定）'}\n\n# キャラクター設定\n${novel.characters || '（未設定）'}\n`.trim(); }
    function generateSubtitlePrompt(subtitle) { return `\n# サブタイトル: ${subtitle.subtitle || '（未設定）'}\n# 話数: 第${subtitle.episode || '?'}話\n# 長さ: ${subtitle.length || '（未設定）'}\n# トーン1(高): ${subtitle.tone1 || 'なし'}\n# トーン2(中): ${subtitle.tone2 || 'なし'}\n# トーン3(低): ${subtitle.tone3 || 'なし'}\n\n# プロット\n${subtitle.plot || '※ここからプロットスタート'}\n\n# 特記事項\n${subtitle.notes || '※ここから特記事項スタート'}\n`.trim(); }
    function updateCombinedNovelPrompt() { combinedNovelPromptTextarea.value = (currentNovelIndex !== null && novels[currentNovelIndex]) ? generateCombinedNovelPrompt(novels[currentNovelIndex]) : ''; }
    function updateSubtitlePromptOutput(element, index) { const output = element.querySelector('.subtitle-prompt-output'); if (output && currentNovelIndex !== null && novels[currentNovelIndex]?.subtitles[index]) output.value = generateSubtitlePrompt(novels[currentNovelIndex].subtitles[index]); }
    function updateSubtitleToggleButtonText(button, text, episode) { button.textContent = `▼ ${episode || '?'}話: ${text || 'サブタイトル未入力'}`; }

    // Utility Functions
    function copyToClipboard(text, button) { navigator.clipboard?.writeText(text).then(() => { if(button){ const orig = button.textContent; button.textContent = 'コピー!'; setTimeout(() => button.textContent = orig, 1500);} }).catch(err => alert('コピー失敗')); }
    async function pasteFromClipboard(target) { try { const text = await navigator.clipboard?.readText(); if(text === undefined) throw new Error(); const start = target.selectionStart, end = target.selectionEnd; target.value = target.value.substring(0, start) + text + target.value.substring(end); target.selectionStart = target.selectionEnd = start + text.length; target.focus(); target.dispatchEvent(new Event('input',{bubbles:true})); target.dispatchEvent(new Event('change',{bubbles:true})); } catch(err){ alert('ペースト失敗'); } }
    function addCollapsibleFunctionality(section) { const btn = section.querySelector('.toggle-button'); const content = section.querySelector('.collapsible-content'); if (btn && content) { btn.addEventListener('click', () => { const isCollapsed = content.classList.toggle('collapsed'); btn.textContent = isCollapsed ? btn.textContent.replace('▼', '▶') : btn.textContent.replace('▶', '▼'); }); if (!content.classList.contains('initially-open') && !content.classList.contains('collapsed')) { content.classList.add('collapsed'); btn.textContent = btn.textContent.replace('▼', '▶'); } else if (content.classList.contains('initially-open') && content.classList.contains('collapsed')) { content.classList.remove('collapsed'); btn.textContent = btn.textContent.replace('▶', '▼'); } } }
    function openCollapsible(section) { const btn = section.querySelector('.toggle-button'); const content = section.querySelector('.collapsible-content'); if (btn && content?.classList.contains('collapsed')) { content.classList.remove('collapsed'); btn.textContent = btn.textContent.replace('▶', '▼'); } }

    // Global Event Listeners Setup
    function addGlobalEventListeners() {
        menuButton.addEventListener('click', handleMenuToggle); createNewNovelButton.addEventListener('click', handleCreateNewNovel);
        deleteNovelButton.addEventListener('click', handleDeleteNovel); novelTitleInput.addEventListener('input', handleNovelInputChange);
        novelSettingTextarea.addEventListener('input', handleNovelInputChange); novelCharactersTextarea.addEventListener('input', handleNovelInputChange);
        copyCombinedNovelPromptButton.addEventListener('click', () => copyToClipboard(combinedNovelPromptTextarea.value, copyCombinedNovelPromptButton));
        addSubtitleButton.addEventListener('click', handleAddSubtitle);
        document.querySelectorAll('#novel-setup .collapsible-section').forEach(addCollapsibleFunctionality);
        document.body.addEventListener('click', async (e) => { const t = e.target; if (t.matches('.copy-btn[data-target]')) { const el = document.getElementById(t.dataset.target); if (el) copyToClipboard(el.value, t); } else if (t.matches('.copy-btn[data-target-class]')) { const c = t.closest('.collapsible-content')?.querySelector(`.${t.dataset.targetClass}`); if (c) copyToClipboard(c.value, t); } else if (t.matches('.paste-btn[data-target]')) { const el = document.getElementById(t.dataset.target); if (el) await pasteFromClipboard(el); } else if (t.matches('.paste-btn[data-target-class]')) { const c = t.closest('.collapsible-content')?.querySelector(`.${t.dataset.targetClass}`); if (c) await pasteFromClipboard(c); } else if (t.matches('.copy-subtitle-prompt-button')) { const p = t.closest('.collapsible-content')?.querySelector('.subtitle-prompt-output'); if (p) copyToClipboard(p.value, t); } });
        document.addEventListener('click', (e) => { if (!novelMenu.contains(e.target) && !menuButton.contains(e.target) && novelMenu.classList.contains('visible')) closeMenu(); });
    }

}); // End DOMContentLoaded