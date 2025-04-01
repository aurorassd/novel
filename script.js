document.addEventListener('DOMContentLoaded', () => {
    const MAX_NOVELS = 10;
    const STORAGE_KEY = 'aiNovelAssistantData_v1';

    // --- DOM Elements ---
    // (変更なし：menuButton, novelMenu, novelListElement, ... subtitleTemplate)
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
    const addSubtitleButton = document.getElementById('add-subtitle-button');
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
    function setupInitialView() { /* ... 初期表示と表示切り替え (変更なし) ... */ }
    function renderNovelDetails(index) { /* ... 小説詳細レンダリング (変更なし) ... */ }

    function addSubtitleElement(subtitleData, subtitleIndex) {
        // サブタイトル要素作成・設定
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

        // 値の設定 (変更なし)
        subtitleInput.value = subtitleData.subtitle || '';
        lengthSelect.value = subtitleData.length || '中尺';
        tone1Select.value = subtitleData.tone1 || 'なし';
        tone2Select.value = subtitleData.tone2 || 'なし';
        tone3Select.value = subtitleData.tone3 || 'なし';
        plotTextarea.value = subtitleData.plot || '';
        notesTextarea.value = subtitleData.notes || '';

        populateEpisodeSelect(episodeSelect, subtitleData.episode);
        updateSubtitleToggleButtonText(toggleButton, subtitleData.subtitle, subtitleData.episode);

        // ▼▼▼ 修正: イベントリスナーの登録方法を明確化 ▼▼▼
        // 各入力要素を取得
        const elementsToWatch = [
            subtitleInput, episodeSelect, lengthSelect,
            tone1Select, tone2Select, tone3Select,
            plotTextarea, notesTextarea
        ];

        // イベントタイプを要素ごとに設定
        elementsToWatch.forEach(element => {
            const eventType = (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')
                ? 'input' // テキスト入力系は入力中に更新
                : 'change'; // プルダウン等は変更完了時に更新
            element.addEventListener(eventType, handleSubtitleInputChange);
        });
        // ▲▲▲ 修正 ▲▲▲

        // 他のイベントリスナー設定 (変更なし)
        copyPromptButton.addEventListener('click', () => copyToClipboard(promptOutput.value, copyPromptButton));
        deleteButton.addEventListener('click', () => { /* ... */ });

        // 初期化処理 (変更なし)
        addCollapsibleFunctionality(subtitleEntry);
        updateSubtitlePromptOutput(subtitleEntry, subtitleIndex); // ★ 初期表示時のプロンプト生成
        subtitleListContainer.appendChild(subtitleEntry);
    }

    function populateEpisodeSelect(selectElement, selectedEpisode) { /* ... 話数プルダウン生成 (変更なし) ... */ }


    // --- Event Handlers ---

    // ▼▼▼ 修正: サブタイトル入力変更ハンドラ ▼▼▼
    // この関数自体は変更ありませんが、呼び出されるタイミングが上記修正で明確化されます
    function handleSubtitleInputChange(event) {
        if (currentNovelIndex === null) return; // 現在選択中の小説がない場合は何もしない

        const targetElement = event.target; // イベントが発生した要素
        const subtitleEntry = targetElement.closest('.subtitle-entry'); // 要素が含まれるサブタイトル全体 (.subtitle-entry) を取得
        if (!subtitleEntry) return; // サブタイトル要素が見つからなければ終了

        const subtitleIndex = parseInt(subtitleEntry.dataset.subtitleIndex, 10); // data-subtitle-index からインデックスを取得
        // インデックスが無効、または対応するデータが存在しない場合はエラーとして終了
        if (isNaN(subtitleIndex) || !novels[currentNovelIndex]?.subtitles?.[subtitleIndex]) {
            console.error("Error: Could not find subtitle data for index", subtitleIndex, event);
            return;
        }

        const subtitle = novels[currentNovelIndex].subtitles[subtitleIndex]; // 対応するサブタイトルデータを取得
        const { value } = targetElement; // 変更後の値を取得
        const toggleButton = subtitleEntry.querySelector('.toggle-button'); // 折りたたみボタン

        // どの要素が変更されたかに応じて、対応するデータを更新
        if (targetElement.classList.contains('subtitle-input')) {
            subtitle.subtitle = value;
            updateSubtitleToggleButtonText(toggleButton, value, subtitle.episode); // ボタンのテキストも更新
        } else if (targetElement.classList.contains('episode-select')) {
            subtitle.episode = parseInt(value, 10) || 1; // 数値に変換、失敗したら1
            updateSubtitleToggleButtonText(toggleButton, subtitle.subtitle, subtitle.episode); // ボタンのテキストも更新
        } else if (targetElement.classList.contains('length-select')) {
            subtitle.length = value;
        } else if (targetElement.classList.contains('tone1-select')) {
            subtitle.tone1 = value;
        } else if (targetElement.classList.contains('tone2-select')) {
            subtitle.tone2 = value;
        } else if (targetElement.classList.contains('tone3-select')) {
            subtitle.tone3 = value;
        } else if (targetElement.classList.contains('plot-textarea')) {
            subtitle.plot = value;
        } else if (targetElement.classList.contains('notes-textarea')) {
            subtitle.notes = value;
        } else {
            // 想定外の要素の場合は何もしない
            return;
        }

        // ★★★ 変更を反映してプロンプト出力欄を更新 ★★★
        updateSubtitlePromptOutput(subtitleEntry, subtitleIndex);

        // ★★★ 変更をlocalStorageに保存 ★★★
        saveData();
    }
    // ▲▲▲ 修正 ▲▲▲


    // 他のイベントハンドラ (変更なし)
    function handleMenuToggle() { /* ... */ }
    function closeMenu() { /* ... */ }
    function handleCreateNewNovel() { /* ... */ }
    function handleDeleteNovel() { /* ... */ }
    function switchNovel(index) { /* ... */ }
    function handleNovelInputChange(event) { /* ... */ }
    function handleAddSubtitle() { /* ... */ } // ボタンクリック時の処理 (変更なし)
    function deleteSubtitle(subtitleIndex) { /* ... */ }

    // --- Prompt Generation (変更なし) ---
    function generateCombinedNovelPrompt(novel) { /* ... */ }
    function generateSubtitlePrompt(subtitle) { /* ... */ }
    function updateCombinedNovelPrompt() { /* ... */ }

    // ▼▼▼ 修正: サブタイトルプロンプト更新関数 ▼▼▼
    // この関数自体は変更ありませんが、呼び出し元が明確化されたことで意図通り動作するはずです
    function updateSubtitlePromptOutput(subtitleElement, subtitleIndex) {
        // 引数チェック
        if (!subtitleElement || typeof subtitleIndex !== 'number' || currentNovelIndex === null) {
             // console.warn("updateSubtitlePromptOutput: Invalid arguments or state.");
             return;
        }
        // データ存在チェック
        const subtitleData = novels[currentNovelIndex]?.subtitles?.[subtitleIndex];
        if (!subtitleData) {
            // console.warn("updateSubtitlePromptOutput: Subtitle data not found for index", subtitleIndex);
            return;
        }

        const promptOutputTextarea = subtitleElement.querySelector('.subtitle-prompt-output');
        if (promptOutputTextarea) {
             // 最新の subtitleData を使ってプロンプトを生成し、テキストエリアに設定
             promptOutputTextarea.value = generateSubtitlePrompt(subtitleData);
        } else {
            // console.warn("updateSubtitlePromptOutput: Prompt output textarea not found in element", subtitleElement);
        }
    }
    // ▲▲▲ 修正 ▲▲▲
    function updateSubtitleToggleButtonText(button, subtitleText, episode) { /* ... */ }

    // --- Utility Functions (変更なし) ---
    function copyToClipboard(text, buttonElement = null) { /* ... */ }
    async function pasteFromClipboard(targetElement) { /* ... */ }
    function addCollapsibleFunctionality(sectionElement) { /* ... */ }
    function openCollapsible(sectionElement) { /* ... */ }

    // --- Global Event Listeners Setup (変更なし) ---
    function addGlobalEventListeners() { /* ... */ }


    // --- 再掲: 変更のなかった関数や省略した部分を含む完全なコード ---
    // Data Handling
    function saveData() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(novels)); } catch (e) { console.error("Error saving data:", e); alert("データ保存失敗"); } }
    function loadData() { const data = localStorage.getItem(STORAGE_KEY); if (data) { try { novels = JSON.parse(data); if (!Array.isArray(novels)) novels = []; } catch (e) { console.error("Error parsing data:", e); novels = []; alert("データ読込失敗"); localStorage.removeItem(STORAGE_KEY); } } else { novels = []; } if (novels.length > MAX_NOVELS) { novels = novels.slice(0, MAX_NOVELS); saveData(); } }
    // UI Rendering (サイドメニュー)
    function renderNovelList() { novelListElement.innerHTML = ''; if (novels.length === 0) { novelListElement.innerHTML = '<li>まだ小説がありません</li>'; } else { novels.forEach((novel, index) => { const li = document.createElement('li'); li.textContent = novel.title || `無題 ${index + 1}`; li.dataset.index = index; if (index === currentNovelIndex) li.classList.add('active'); li.addEventListener('click', () => { switchNovel(index); closeMenu(); }); novelListElement.appendChild(li); }); } createNewNovelButton.disabled = novels.length >= MAX_NOVELS; createNewNovelButton.title = novels.length >= MAX_NOVELS ? `最大${MAX_NOVELS}件` : '新規作成'; }
    // UI Rendering (メインリスト)
    function renderMainNovelList() { mainNovelListUl.innerHTML = ''; if (novels.length > 0) { novelListMainSection.classList.remove('hidden'); noNovelsMessage.classList.add('hidden'); mainNovelListUl.classList.remove('hidden'); novels.forEach((novel, index) => { const li = document.createElement('li'); li.textContent = novel.title || `無題 ${index + 1}`; li.dataset.index = index; li.addEventListener('click', () => switchNovel(index)); mainNovelListUl.appendChild(li); }); } else { novelListMainSection.classList.remove('hidden'); mainNovelListUl.classList.add('hidden'); noNovelsMessage.classList.remove('hidden'); } }
    // UI Rendering (初期表示)
    function setupInitialView() { if (currentNovelIndex !== null && novels[currentNovelIndex]) { novelListMainSection.classList.add('hidden'); addSubtitleButton.style.display = 'block'; renderNovelDetails(currentNovelIndex); } else { novelDetailsElement.classList.add('hidden'); addSubtitleButton.style.display = 'none'; renderMainNovelList(); } closeMenu(); }
    // UI Rendering (詳細表示)
    function renderNovelDetails(index) { if (index < 0 || index >= novels.length) { console.error("Invalid novel index:", index); currentNovelIndex = null; setupInitialView(); return; } currentNovelIndex = index; const novel = novels[index]; novelListMainSection.classList.add('hidden'); novelDetailsElement.classList.remove('hidden'); addSubtitleButton.style.display = 'block'; novelTitleInput.value = novel.title || ''; novelSettingTextarea.value = novel.setting || ''; novelCharactersTextarea.value = novel.characters || ''; updateCombinedNovelPrompt(); subtitleListContainer.innerHTML = ''; if (novel.subtitles && Array.isArray(novel.subtitles)) { novel.subtitles.forEach((subtitle, subtitleIndex) => addSubtitleElement(subtitle, subtitleIndex)); } else { novel.subtitles = []; } renderNovelList(); }
    // UI Rendering (話数プルダウン)
    function populateEpisodeSelect(selectElement, selectedEpisode) { selectElement.innerHTML = ''; const maxEpisodes = 99; for (let i = 1; i <= maxEpisodes; i++) { const option = document.createElement('option'); option.value = i; option.textContent = `${i}話`; selectElement.appendChild(option); } selectElement.value = (selectedEpisode >= 1 && selectedEpisode <= maxEpisodes) ? selectedEpisode : 1; }
    // UI Rendering (サブタイトル削除ボタンハンドラ) in addSubtitleElement
    // deleteButton.addEventListener('click', () => { /* ... */ }); の実装
     deleteButton.addEventListener('click', () => {
         if (confirm(`「${subtitleData.subtitle || '無題'}」(第${subtitleData.episode}話) を削除しますか？`)) {
             deleteSubtitle(subtitleIndex);
         }
     });
    // Event Handlers
    function handleMenuToggle() { novelMenu.classList.toggle('visible'); }
    function closeMenu() { novelMenu.classList.remove('visible'); }
    function handleCreateNewNovel() { if (novels.length >= MAX_NOVELS) { alert(`最大${MAX_NOVELS}件`); return; } const newNovel = { title: `新規 ${novels.length + 1}`, setting: '', characters: '', subtitles: [] }; novels.push(newNovel); currentNovelIndex = novels.length - 1; saveData(); renderNovelList(); setupInitialView(); novelTitleInput.focus(); openCollapsible(document.querySelector('#novel-setup .collapsible-section:nth-child(1)')); openCollapsible(document.querySelector('#novel-setup .collapsible-section:nth-child(2)')); openCollapsible(document.querySelector('#novel-setup .collapsible-section:nth-child(3)')); }
    function handleDeleteNovel() { if (currentNovelIndex === null || !novels[currentNovelIndex]) return; const title = novels[currentNovelIndex].title || `無題 ${currentNovelIndex + 1}`; if (confirm(`「${title}」を削除しますか？`)) { novels.splice(currentNovelIndex, 1); currentNovelIndex = null; saveData(); renderNovelList(); setupInitialView(); } }
    function switchNovel(index) { if (index >= 0 && index < novels.length) { currentNovelIndex = index; } else { console.error("Invalid index:", index); currentNovelIndex = null; } setupInitialView(); closeMenu(); }
    function handleNovelInputChange(event) { if (currentNovelIndex === null) return; const novel = novels[currentNovelIndex]; const { id, value } = event.target; if (id === 'novel-title') { novel.title = value; renderNovelList(); } else if (id === 'novel-setting') novel.setting = value; else if (id === 'novel-characters') novel.characters = value; updateCombinedNovelPrompt(); saveData(); }
    function handleAddSubtitle() { if (currentNovelIndex === null) return; const novel = novels[currentNovelIndex]; const nextEpisode = novel.subtitles.length + 1; const newSubtitle = { subtitle: '', episode: nextEpisode, length: '中尺', tone1: 'なし', tone2: 'なし', tone3: 'なし', plot: '', notes: '' }; novel.subtitles.push(newSubtitle); addSubtitleElement(newSubtitle, novel.subtitles.length - 1); saveData(); const newElement = subtitleListContainer.lastElementChild; if (newElement) { newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); openCollapsible(newElement); } }
    function deleteSubtitle(subtitleIndex) { if (currentNovelIndex === null) return; const novel = novels[currentNovelIndex]; if (subtitleIndex < 0 || subtitleIndex >= novel.subtitles.length) return; novel.subtitles.splice(subtitleIndex, 1); saveData(); renderNovelDetails(currentNovelIndex); }
    // Prompt Generation
    function generateCombinedNovelPrompt(novel) { return `\n# タイトル\n${novel.title || '（未設定）'}\n\n# 舞台設定\n${novel.setting || '（未設定）'}\n\n# キャラクター設定\n${novel.characters || '（未設定）'}\n`.trim(); }
    function generateSubtitlePrompt(subtitle) { return `\n# サブタイトル: ${subtitle.subtitle || '（未設定）'}\n# 話数: 第${subtitle.episode || '?'}話\n# 長さ: ${subtitle.length || '（未設定）'}\n# トーン1(優先度高): ${subtitle.tone1 || 'なし'}\n# トーン2(優先度中): ${subtitle.tone2 || 'なし'}\n# トーン3(優先度低): ${subtitle.tone3 || 'なし'}\n\n# プロット\n${subtitle.plot || '※ここからプロットスタート'}\n\n# 特記事項\n${subtitle.notes || '※ここから特記事項スタート'}\n`.trim(); }
    function updateCombinedNovelPrompt() { combinedNovelPromptTextarea.value = (currentNovelIndex !== null && novels[currentNovelIndex]) ? generateCombinedNovelPrompt(novels[currentNovelIndex]) : ''; }
    function updateSubtitleToggleButtonText(button, text, episode) { button.textContent = `▼ ${episode || '?'}話: ${text || 'サブタイトル未入力'}`; }
    // Utility Functions
    function copyToClipboard(text, button) { navigator.clipboard?.writeText(text).then(() => { if(button){ const orig = button.textContent; button.textContent = 'コピー!'; setTimeout(() => button.textContent = orig, 1500);} }).catch(err => alert('コピー失敗')); }
    async function pasteFromClipboard(target) { try { const text = await navigator.clipboard?.readText(); if(text === undefined) throw new Error(); const start = target.selectionStart, end = target.selectionEnd; target.value = target.value.substring(0, start) + text + target.value.substring(end); target.selectionStart = target.selectionEnd = start + text.length; target.focus(); target.dispatchEvent(new Event('input',{bubbles:true})); target.dispatchEvent(new Event('change',{bubbles:true})); } catch(err){ alert('ペースト失敗'); } }
    function addCollapsibleFunctionality(section) { const btn = section.querySelector('.toggle-button'); const content = section.querySelector('.collapsible-content'); if (btn && content) { btn.addEventListener('click', () => { const isCollapsed = content.classList.toggle('collapsed'); btn.textContent = isCollapsed ? btn.textContent.replace('▼', '▶') : btn.textContent.replace('▶', '▼'); }); if (!content.classList.contains('initially-open') && !content.classList.contains('collapsed')) { content.classList.add('collapsed'); btn.textContent = btn.textContent.replace('▼', '▶'); } else if (content.classList.contains('initially-open') && content.classList.contains('collapsed')) { content.classList.remove('collapsed'); btn.textContent = btn.textContent.replace('▶', '▼'); } } }
    function openCollapsible(section) { const btn = section.querySelector('.toggle-button'); const content = section.querySelector('.collapsible-content'); if (btn && content?.classList.contains('collapsed')) { content.classList.remove('collapsed'); btn.textContent = btn.textContent.replace('▶', '▼'); } }
    // Global Event Listeners Setup
    function addGlobalEventListeners() { menuButton.addEventListener('click', handleMenuToggle); createNewNovelButton.addEventListener('click', handleCreateNewNovel); deleteNovelButton.addEventListener('click', handleDeleteNovel); novelTitleInput.addEventListener('input', handleNovelInputChange); novelSettingTextarea.addEventListener('input', handleNovelInputChange); novelCharactersTextarea.addEventListener('input', handleNovelInputChange); copyCombinedNovelPromptButton.addEventListener('click', () => copyToClipboard(combinedNovelPromptTextarea.value, copyCombinedNovelPromptButton)); addSubtitleButton.addEventListener('click', handleAddSubtitle); document.querySelectorAll('#novel-setup .collapsible-section').forEach(addCollapsibleFunctionality); document.body.addEventListener('click', async (e) => { const t = e.target; if (t.matches('.copy-btn[data-target]')) { const el = document.getElementById(t.dataset.target); if (el) copyToClipboard(el.value, t); } else if (t.matches('.copy-btn[data-target-class]')) { const c = t.closest('.collapsible-content')?.querySelector(`.${t.dataset.targetClass}`); if (c) copyToClipboard(c.value, t); } else if (t.matches('.paste-btn[data-target]')) { const el = document.getElementById(t.dataset.target); if (el) await pasteFromClipboard(el); } else if (t.matches('.paste-btn[data-target-class]')) { const c = t.closest('.collapsible-content')?.querySelector(`.${t.dataset.targetClass}`); if (c) await pasteFromClipboard(c); } else if (t.matches('.copy-subtitle-prompt-button')) { const p = t.closest('.collapsible-content')?.querySelector('.subtitle-prompt-output'); if (p) copyToClipboard(p.value, t); } }); document.addEventListener('click', (e) => { if (!novelMenu.contains(e.target) && !menuButton.contains(e.target) && novelMenu.classList.contains('visible')) closeMenu(); }); }

}); // End DOMContentLoaded