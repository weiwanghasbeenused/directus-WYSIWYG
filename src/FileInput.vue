<!-- export const prefix = 'mml'; -->

<template>
	<div :class="`${prefix}file-input-container`" :data-status="status" :data-view>
        <input :id="`${id}-input`" type="file" @change="onFileSelected">
        <label :for="`${id}-input`"><div class="upload-preview-container"><img class="upload-preview" ref="previewRef"></div><div class="upload-message-container">{{ message }}</div></label>
        <div class="buttons-container flex-container">
            <button class="button button-confirm outline" @click="uploadFile">Upload</button>
            <button class="button button-cancel outline" @click="close">Cancel</button>
        </div>
    </div>
</template>
    
<script>
import { ref } from 'vue';

export default {
	props: {
        id: {
            type: String,
            default: parseInt( 100000 * Math.random() )
        },
		prefix: {
            type: String,
            default: '',
        },
    },
    components: {
        
    },
    emits: ['input'],
	setup(props, { emit }) {
        
        const status = ref(0);
        const message = ref('Click to upload');
        const previewRef = ref(null);
        const api_base_url = '';
        let selectedFile = null;

        const editorOptions = {
			// debug: 'info',
			modules: {
				toolbar: {
					'container': [[{ header: [1, 2, false] }], ['bold', 'italic', { 'list': 'ordered'}, { 'list': 'bullet'}], ['link', 'image', 'video'], ['code-block']],
					'handlers': {
						'image': function (value){
							mediaManagerRef.value.openManager();
						}
					}
				},
				clipboard: {
					matchVisual: false, // Prevents Quill from modifying the HTML
				},
			},
			theme: 'snow'
		}

        function updateStatus(status_code){
            /*
                0: no file
                1: file selected
            */
            status.value = status_code;
            message.value = status_code === 0 ? 'Upload a file' : 'Select another one';
        }
        
        function onFileSelected(event) {
            let el = event.target;
            if (el.files && el.files[0]) {
                const preview = previewRef.value;
                updateStatus(1);
                selectedFile = el.files[0];
                preview.src = URL.createObjectURL(selectedFile);
            }
		}
        function close(){
            updateStatus(0);
        }
        async function uploadFile(){
            if (status.value !== 1 || !selectedFile) return;
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const response = await fetch(api_base_url + '/files', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const fileData = await response.json();
                    emit('fileUploaded', fileData['data']);
                    close();
                } else {
                    console.error('File upload failed.');
                }
            } catch (error) {
                console.error('Upload error:', error);
            }

			// Emit change or input event to notify that the entry has been updated
			// this.$emit('change', this.value);
        }

        if(previewRef.value) {
            let img = previewRef.value;
            img.onload = function(){
                URL.revokeObjectURL(img.src);  // no longer needed, free memory
            }
        }
		return { 
            status,
            message,
            onFileSelected,
            uploadFile,
            previewRef,
            close,
            editorOptions,
         };
	},
};
</script>

<style>

.mml-file-input-container {
    position: absolute;
    display: inline-block;
    background-color: #fff;
    top: 0px;
    left: 0px;
}
.mml-file-input-container[data-status="0"] {
    top: 25px;
    left: 25px;
    width: calc(var(--block-size) - 20px);
}
.upload-preview {
    display: none;
}
img.upload-preview {
    width: 100%;
    padding: 20px;
}
.mml-file-input-container input[type='file'] {
    display: none;
}
.mml-file-input-container .buttons-container {
    width: 100%;
    height: var(--button-height);
    position: absolute;
    bottom: 0;
    left: 0;
    display: none;
}
.mml-file-input-container .buttons-container > button {
    flex: 1;
    text-align: center;
}

.mml-file-input-container label {
    position: relative;
    cursor: pointer;
    border: 2px solid #00f;
    color: #00f;
    font-weight: 700;
}
.mml-file-input-container label:hover {
    background-color: #00f;
    color: #fff;
}
.mml-file-input-container[data-status="0"] label {
    padding-top: 100%;
}
.mml-file-input-container[data-status="1"] label {
    height: 200px;
}
.upload-message-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
}

.upload-preview-container {
    /* position: absolute; */
    /* top: 0;
    left: 0; */
}
.upload-preview-container, .upload-preview {
    width: 100%;
    height: 100%;
}
.upload-preview {
    object-fit: contain
}


.mml-file-input-container[data-status="1"] {
    display: block;
    /* position: absolute; */
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    padding-bottom: var(--button-height);
}
.mml-file-input-container[data-status="1"] .buttons-container {
    display: flex;
}
.mml-file-input-container[data-status="1"] .upload-message-container{
    display: none;
    width: 100%;
    height: 100%;
    z-index: 100;
    /* top: 0; */
    /* left: 0; */
}
.mml-file-input-container[data-status="1"] label:hover .upload-message-container {
    display: flex;
    /* background-color: #00f; */
    /* mix-blend-mode: multiply; */
}
.mml-file-input-container[data-status="1"] label:hover .upload-preview-container {
    opacity: 0.25;
}
.mml-file-input-container[data-status="1"] .upload-preview {
    display: block;
}

</style>