<template>
  <div class="file-upload">
    <n-upload
      :action="uploadUrl"
      :headers="uploadHeaders"
      :data="uploadData"
      :max="1"
      :accept="accept"
      :show-file-list="showFileList"
      @finish="handleFinish"
      @error="handleError"
      @progress="handleProgress"
    >
      <n-button>
        <template #icon>
          <n-icon><CloudUploadOutline /></n-icon>
        </template>
        选择文件
      </n-button>
    </n-upload>

    <!-- 图片预览 -->
    <div v-if="modelValue && isImage" class="mt-2">
      <img :src="modelValue" alt="预览" class="max-w-[200px] max-h-[200px] rounded border" />
    </div>

    <!-- 上传进度 -->
    <n-progress
      v-if="uploading"
      type="line"
      :percentage="uploadProgress"
      :height="4"
      class="mt-2"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/utils/constants'
import { CloudUploadOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

const props = defineProps<{
  modelValue: string
  accept?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const message = useMessage()
const authStore = useAuthStore()

const uploadUrl = `${API_BASE_URL}/files/upload`
const uploading = ref(false)
const uploadProgress = ref(0)
const showFileList = ref(false)

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

const uploadData = ref({})

const isImage = computed(() => {
  if (!props.modelValue) return false
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(props.modelValue)
})

function handleFinish({ file, event }: { file: any; event: any }) {
  try {
    const response = JSON.parse(event.target.response)
    if (response.data?.url) {
      emit('update:modelValue', response.data.url)
      message.success('上传成功')
    }
  } catch {
    message.error('上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

function handleError() {
  uploading.value = false
  uploadProgress.value = 0
  message.error('上传失败')
}

function handleProgress({ percent }: { percent: number }) {
  uploading.value = true
  uploadProgress.value = percent
}
</script>