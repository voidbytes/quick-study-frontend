<template>
  <div class="max-w-5xl mx-auto">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-bold text-neutral-900 flex items-center gap-2">
          代码运行台
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 inline-flex items-center gap-1">
            <n-icon :size="13"><FlashOutline /></n-icon>
            Playground
          </span>
        </h1>
        <p class="text-sm text-neutral-400 mt-1">编写并运行任意语言的代码片段 · 随时实验、不保存、不计分</p>
      </div>
      <div class="flex gap-2">
        <n-button size="small" @click="loadSample">
          <template #icon><n-icon><SparklesOutline /></n-icon></template>
          恢复示例
        </n-button>
        <n-button size="small" quaternary @click="clearAll">
          <template #icon><n-icon><TrashOutline /></n-icon></template>
          清空
        </n-button>
      </div>
    </div>

    <!-- Editor Card -->
    <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden" :class="darkTheme ? 'editor-dark' : ''">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-neutral-200 bg-neutral-50">
        <n-select
          v-model:value="langCode"
          :options="langOptions"
          size="small"
          class="w-52"
          @update:value="onLangChange"
        />
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white font-mono text-sm text-neutral-700">
          <n-icon :size="14" class="text-primary-500"><DocumentTextOutline /></n-icon>
          <span>{{ currentFile }}</span>
        </div>
        <div class="w-px h-5 bg-neutral-200" />
        <n-tooltip>
          <template #trigger>
            <n-button size="small" quaternary circle @click="toggleTheme">
              <template #icon><n-icon><MoonOutline v-if="darkTheme" /><SunnyOutline v-else /></n-icon></template>
            </n-button>
          </template>
          切换编辑器主题
        </n-tooltip>
        <div class="flex-1" />
        <n-tooltip>
          <template #trigger>
            <n-button size="small" quaternary circle @click="copyCode">
              <template #icon><n-icon><CopyOutline /></n-icon></template>
            </n-button>
          </template>
          复制代码
        </n-tooltip>
        <n-tooltip>
          <template #trigger>
            <n-button size="small" quaternary circle @click="toggleFullscreen">
              <template #icon><n-icon><OpenOutline /></n-icon></template>
            </n-button>
          </template>
          全屏编辑器
        </n-tooltip>
      </div>

      <!-- Editor -->
      <div class="relative">
        <div ref="editorEl" class="playground-editor" :class="darkTheme ? 'playground-editor-dark' : ''"></div>
      </div>

      <!-- stdin -->
      <div class="border-t border-neutral-200">
        <div class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-neutral-500 bg-neutral-50 border-b border-neutral-200">
          <n-icon :size="16" class="text-primary-500"><TerminalOutline /></n-icon>
          <span>标准输入 (stdin)</span>
          <span class="ml-auto text-xs font-normal text-neutral-400">代码通过 readline / input() / Scanner 读取时将显示在终端</span>
        </div>
        <textarea
          v-model="stdin"
          placeholder="标准输入：每行一个输入，行末自带换行&#10;例如：&#10;Quick Study&#10;123 456"
          spellcheck="false"
          class="w-full min-h-[120px] px-4 py-3 border-none outline-none resize-y font-mono text-[13px] leading-relaxed text-neutral-900 bg-white"
        />
      </div>

      <!-- Run bar -->
      <div class="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-neutral-200 bg-neutral-50">
        <n-button type="primary" :loading="running" @click="run">
          <template #icon><n-icon><PlayOutline /></n-icon></template>
          运行
        </n-button>
        <span class="text-xs text-neutral-400">
          快捷键 <kbd class="px-1 py-0.5 border border-neutral-300 border-b-2 rounded font-mono text-[11px] text-neutral-500 bg-white">Ctrl</kbd> +
          <kbd class="px-1 py-0.5 border border-neutral-300 border-b-2 rounded font-mono text-[11px] text-neutral-500 bg-white">Enter</kbd>
        </span>
        <div class="ml-auto flex items-center gap-3 text-xs text-neutral-400">
          <span class="inline-flex items-center gap-1"><n-icon :size="14"><TimeOutline /></n-icon>单次运行 ≤ 30s</span>
        </div>
      </div>
    </div>

    <!-- Output Card -->
    <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden mt-5">
      <div class="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-neutral-200 bg-neutral-50">
        <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          <n-icon :size="16" class="text-primary-500"><TerminalOutline /></n-icon>
          输出结果
        </span>
        <span v-if="status !== 'idle'" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="statusClass">
          <n-icon :size="13" v-if="status === 'running'"><HourglassOutline /></n-icon>
          <n-icon :size="13" v-else-if="status === 'success'"><CheckmarkCircleOutline /></n-icon>
          <n-icon :size="13" v-else-if="status === 'timedout'"><TimeOutline /></n-icon>
          <n-icon :size="13" v-else><CloseCircleOutline /></n-icon>
          <span>{{ statusText }}</span>
        </span>
        <div class="ml-auto flex items-center gap-2">
          <n-button size="tiny" quaternary @click="clearOutput">
            <template #icon><n-icon :size="14"><TrashOutline /></n-icon></template>
            清空
          </n-button>
          <n-tooltip>
            <template #trigger>
              <n-button size="tiny" quaternary circle @click="copyOutput">
                <template #icon><n-icon :size="14"><CopyOutline /></n-icon></template>
              </n-button>
            </template>
            复制输出
          </n-tooltip>
        </div>
      </div>

      <div class="p-5">
        <!-- 空状态 -->
        <div v-if="!hasOutput" class="flex flex-col items-center gap-2 py-12 text-neutral-400 text-center">
          <n-icon :size="40" class="text-neutral-300"><TerminalOutline /></n-icon>
          <p class="text-sm">点击「运行」执行代码，输出将显示在这里</p>
        </div>

        <!-- 编译错误 -->
        <div v-else-if="compileError" class="mb-4">
          <div class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">编译错误</div>
          <pre class="bg-red-50 border border-red-100 rounded-lg p-3 font-mono text-[13px] leading-relaxed text-red-600 whitespace-pre-wrap break-all">{{ compileError }}</pre>
        </div>

        <template v-else-if="result">
          <!-- stdout -->
          <div v-if="result.stdout" class="mb-4">
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              <n-icon :size="14"><ArrowUpOutline /></n-icon>
              标准输出 stdout
            </div>
            <pre class="bg-neutral-50 border border-neutral-200 rounded-lg p-3 font-mono text-[13px] leading-relaxed text-neutral-900 whitespace-pre-wrap break-all max-h-[220px] overflow-auto">{{ result.stdout }}</pre>
          </div>

          <!-- stderr -->
          <div v-if="result.stderr">
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              <n-icon :size="14"><ArrowDownOutline /></n-icon>
              标准错误 stderr
            </div>
            <pre class="bg-red-50 border border-red-100 rounded-lg p-3 font-mono text-[13px] leading-relaxed text-red-600 whitespace-pre-wrap break-all max-h-[220px] overflow-auto">{{ result.stderr }}</pre>
          </div>

          <!-- meta -->
          <div class="flex flex-wrap items-center gap-5 pt-3 mt-3 border-t border-neutral-200 text-xs text-neutral-400">
            <span class="inline-flex items-center gap-1"><n-icon :size="14"><FlagOutline /></n-icon>退出码 <strong class="text-neutral-600 font-semibold">{{ result.exitCode }}</strong></span>
            <span class="inline-flex items-center gap-1"><n-icon :size="14"><TimeOutline /></n-icon>耗时 <strong class="text-neutral-600 font-semibold">{{ result.timeMs < 0 ? '超时' : result.timeMs + 'ms' }}</strong></span>
            <span class="inline-flex items-center gap-1"><n-icon :size="14"><LanguageOutline /></n-icon>{{ result.languageName }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Sample quick fill -->
    <div class="flex flex-wrap items-center gap-3 mt-5">
      <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
        <n-icon :size="15" class="text-primary-500"><BookOutline /></n-icon>
        示例代码
      </span>
      <n-tag
        v-for="l in languages"
        :key="l.code"
        size="small"
        :type="l.code === langCode ? 'primary' : 'default'"
        :bordered="false"
        class="cursor-pointer"
        @click="insertSample(l.code)"
      >
        {{ l.name }}
      </n-tag>
      <span class="flex-1" />
      <span class="text-xs text-neutral-400">点击示例代码将自动填充到编辑器并切换对应语言</span>
    </div>

    <!-- Notice -->
    <n-alert type="info" class="mt-5" :bordered="false">
      <template #icon><n-icon><InformationCircleOutline /></n-icon></template>
      <strong>关于代码运行台：</strong>所有代码在<strong>安全沙箱</strong>中运行，仅返回运行输出，<strong>不保存、不落库、不计入学习记录</strong>。适合验证语法、实验算法、练习 I/O。提交正式练习/考试请使用题目对应的答题页。
    </n-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMessage } from 'naive-ui'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material-darker.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/go/go.js'
import {
  FlashOutline,
  SparklesOutline,
  TrashOutline,
  DocumentTextOutline,
  MoonOutline,
  SunnyOutline,
  CopyOutline,
  OpenOutline,
  TerminalOutline,
  PlayOutline,
  TimeOutline,
  ShieldCheckmarkOutline,
  HourglassOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  FlagOutline,
  LanguageOutline,
  BookOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import { getPlaygroundLanguages, runPlayground, type PlaygroundLanguage, type PlaygroundRunResponse } from '@/api/judge'

const message = useMessage()

const languages = ref<PlaygroundLanguage[]>([])
const langCode = ref('js')
const code = ref('')
const stdin = ref('')
const running = ref(false)
const darkTheme = ref(false)

const result = ref<PlaygroundRunResponse | null>(null)
const compileError = ref('')
const status = ref<'idle' | 'running' | 'success' | 'timedout' | 'error'>('idle')

/** 语言 → CodeMirror mode（JavaScript 覆盖 TS；clike 覆盖 Java/C++） */
const CM_MODES: Record<string, string> = {
  js: 'javascript',
  py: 'python',
  java: 'text/x-java',
  ts: 'text/typescript',
  cpp: 'text/x-c++src',
  go: 'go'
}

/** 默认示例代码（进入页面默认展示 JS 示例，避免空白编辑器） */
const DEFAULT_SAMPLE_JS = `// 欢迎使用代码运行台
// 选择语言后运行示例，或清空后编写任意代码

function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Quick Study"));`

/** 示例代码（code）与配套默认标准输入（stdin）：读 stdin 的示例带默认输入，开箱即用不阻塞 */
const SAMPLES: Record<string, string> = {
  js: DEFAULT_SAMPLE_JS,
  py: '# Python 示例\nname = input("请输入姓名: ")\nprint(f"Hello, {name}!")\n\n# 读写 stdin 示例\nnums = input().split()\nprint("输入了", len(nums), "个数字")',
  java: '// Java 示例\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.nextLine();\n        System.out.println("Hello, " + name + "!");\n    }\n}',
  ts: '// TypeScript 示例\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Quick Study"));',
  cpp: '// C++ 示例\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    getline(cin, name);\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}',
  go: '// Go 示例\npackage main\n\nimport (\n    "fmt"\n)\n\nfunc main() {\n    var name string\n    fmt.Scanln(&name)\n    fmt.Printf("Hello, %s!", name)\n}'
}

/** 各示例配套的默认标准输入（仅读 stdin 的语言需要；第一行为单词，各语言示例输出一致） */
const SAMPLE_STDIN: Record<string, string> = {
  py: 'Quick\n10 20 30',
  java: 'Quick\n',
  cpp: 'Quick\n',
  go: 'Quick\n'
}

const langOptions = computed(() =>
  languages.value.map(l => ({ label: l.name, value: l.code }))
)

const currentLang = computed(() => languages.value.find(l => l.code === langCode.value))
const currentFile = computed(() => currentLang.value?.fileName ?? 'main.js')

const hasOutput = computed(() => result.value !== null || compileError.value !== '')
const statusText = computed(() => {
  if (status.value === 'running') return '正在运行…'
  if (status.value === 'success') return '运行成功'
  if (status.value === 'timedout') return '运行超时'
  if (status.value === 'error') return '运行失败'
  return ''
})
const statusClass = computed(() => {
  if (status.value === 'running') return 'bg-warning-50 text-warning-600'
  if (status.value === 'success') return 'bg-success-50 text-success-600'
  if (status.value === 'timedout') return 'bg-warning-50 text-warning-600'
  if (status.value === 'error') return 'bg-error-50 text-error-600'
  return ''
})

// ---- CodeMirror ----
const editorEl = ref<HTMLElement | null>(null)
let editor: CodeMirror.Editor | null = null
/** 防止 setValue 触发 change 事件回写造成死循环 */
let syncingFromEditor = false

function setEditorMode(lang: string) {
  if (!editor) return
  const mode = CM_MODES[lang] || 'javascript'
  editor.setOption('mode', mode)
}

function syncEditorFromCode() {
  if (!editor) return
  const cmVal = editor.getValue()
  if (cmVal !== code.value) {
    editor.setValue(code.value)
  }
}

onMounted(async () => {
  // 默认展示 JS 示例（无高亮时的兜底与 CodeMirror 初始值）
  code.value = DEFAULT_SAMPLE_JS

  if (editorEl.value) {
    editor = CodeMirror(editorEl.value, {
      value: code.value,
      mode: 'javascript',
      lineNumbers: true,
      lineWrapping: false,
      indentUnit: 2,
      tabSize: 4,
      theme: darkTheme.value ? 'material-darker' : 'default',
      extraKeys: {
        'Ctrl-Enter': () => { run() },
        'Cmd-Enter': () => { run() }
      }
    })
    editor.on('change', () => {
      if (!editor) return
      syncingFromEditor = true
      code.value = editor.getValue()
      syncingFromEditor = false
    })
  }

  try {
    const res = await getPlaygroundLanguages()
    languages.value = res.data
    if (languages.value.length > 0) {
      const hasJs = languages.value.some(l => l.code === 'js')
      langCode.value = hasJs ? 'js' : languages.value[0].code
      setEditorMode(langCode.value)
    }
  } catch {
    // 语言列表加载失败不阻塞页面（默认 JS 示例已可用）
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor = null
  }
})

watch(langCode, (lang) => {
  setEditorMode(lang)
})

watch(code, () => {
  if (!syncingFromEditor) {
    syncEditorFromCode()
  }
})

watch(darkTheme, (val) => {
  if (editor) {
    editor.setOption('theme', val ? 'material-darker' : 'default')
  }
})

/**
 * 语言切换：若当前代码为空白或仍是任意语言的示例模板（未做实际编辑），
 * 自动填充新语言示例，保证运行的是匹配语言的代码；用户已编辑的内容不覆盖。
 */
function onLangChange(lang: string) {
  const trimmed = code.value.trim()
  const isSampleOrBlank = trimmed === '' || Object.values(SAMPLES).some(s => s === code.value)
  if (isSampleOrBlank) {
    code.value = SAMPLES[lang] ?? ''
    // 示例配套默认 stdin（读 stdin 的语言开箱即用，避免空输入阻塞超时）
    stdin.value = SAMPLE_STDIN[lang] ?? ''
  }
}

function loadSample() {
  code.value = SAMPLES[langCode.value] ?? ''
  stdin.value = SAMPLE_STDIN[langCode.value] ?? ''
}

function insertSample(lang: string) {
  langCode.value = lang
  code.value = SAMPLES[lang] ?? ''
  stdin.value = SAMPLE_STDIN[lang] ?? ''
}

function clearAll() {
  code.value = ''
  stdin.value = ''
  clearOutput()
}

function toggleTheme() {
  darkTheme.value = !darkTheme.value
}

function toggleFullscreen() {
  const el = document.querySelector('.max-w-5xl')
  if (!el) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else if (el.requestFullscreen) {
    el.requestFullscreen()
  }
}

async function run() {
  if (running.value) return
  const trimmed = code.value.trim()
  if (!trimmed) {
    message.warning('请先编写代码')
    return
  }
  running.value = true
  status.value = 'running'
  try {
    const res = await runPlayground({
      languageCode: langCode.value,
      code: code.value,
      stdin: stdin.value
    })
    result.value = res.data
    compileError.value = res.data.compileError ?? ''
    status.value = res.data.timedOut ? 'timedout' : (res.data.success ? 'success' : 'error')
  } catch (e: any) {
    result.value = null
    compileError.value = e?.message || '运行请求失败'
    status.value = 'error'
  } finally {
    running.value = false
  }
}

function clearOutput() {
  result.value = null
  compileError.value = ''
  status.value = 'idle'
}

function copyCode() {
  navigator.clipboard.writeText(code.value).then(() => message.success('代码已复制'))
}

function copyOutput() {
  const text = [result.value?.stdout, result.value?.stderr, compileError.value].filter(Boolean).join('\n')
  if (!text) return
  navigator.clipboard.writeText(text).then(() => message.success('输出已复制'))
}
</script>

<style scoped>
/* CodeMirror 编辑区：默认高度撑起（避免初始过矮），内容超出再滚动 */
.playground-editor :deep(.CodeMirror) {
  height: auto;
  min-height: 320px;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
}
.playground-editor :deep(.CodeMirror-scroll) {
  min-height: 320px;
}
</style>
