<!-- export const prefix = 'mml'; -->

<template>
	<div ref="containerRef" :id="id" :class="`${prefix}figure-editor-container`" data-contains-buttons="bottom" :data-status="status" :data-view="view">
        <img v-if="img_id" :class="`${prefix}img-preivew`" :src="`/assets/${img_id}`" @click="openMediaEditor">
        <div v-else :class="`${prefix}img-preivew-placeholder`" @click="openMediaEditor"><span>Click to select image</span></div>
        <MediaManager :prefix="prefix" :height="mediaManagerHeight" :img_id="img_id" ref="mediaManagerRef" @imageConfirmed="updatePreview" @close="closeMediaEditor"></MediaManager>
        <div :class="`${prefix}caption-editor-wrapper`">
            <QuillEditor ref="quillEditorRef" v-model:content="content" content-type="html" :options="editorOptions" />
        </div>
        <div class="buttons-container flex-container">
            <button class="button button-confirm update-button outline" @click="update">Update</button>
            <button class="button button-cancel outline" @click="close">Cancel</button>
        </div>
    </div>
</template>
    
<script>
import { ref, onMounted, watch } from 'vue';
import FileInput from './FileInput.vue';
import MediaManager from './MediaManager.vue';
import { QuillEditor } from '@vueup/vue-quill';

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
        img_id: {
            type: String,
            default: '',
        },
        caption: {
            type: String,
            default: '',
        },
        insert_position: Number,
        figure_to_replace: Number
    },
    components: {
        'FileInput': FileInput,
        'QuillEditor': QuillEditor,
        'MediaManager': MediaManager
    },
	setup(props, {emit}) {    
        const status = ref(0),
              view = ref(0),
              content = ref(props.caption),
              mediaManagerRef = ref(null),
              mediaManagerHeight = ref(0),
              containerRef = ref(null),
              quillEditorRef = ref(null);
        function updateStatus(code){
            status.value = code;
        }
        function open(){
            console.log('img_id in FigureEditor open():', props.img_id);
            if(!props.caption) {
                const quill = quillEditorRef.value.getQuill();
                quill.setText('');
            } else 
                content.value = props.caption;
            updateStatus(1);
        }   
        function close(){
            emit('close');
            updateStatus(0);
        }      
            
        function updateStatus(status_code){
            /*
                0: image not selected
                1: image selected
            */
            status.value = status_code;
        }
        function updateView(view_code){
            /*
                0: overview
                1: media selector
            */
            view.value = view_code;
        }
        function openMediaEditor(){
            updateView(1);
            console.log('img_id in FigureEditor openMediaEditor():', props.img_id);
            mediaManagerRef.value.open();
        }
        function closeMediaEditor(){
            updateView(0);
        }
        function updatePreview(id){
            props.img_id = id;
            closeMediaEditor();
        }
        function update(){
            try {
                emit('update', { caption: content.value, img_id: props.img_id, insert_position: props.insert_position, figure_to_replace: props.figure_to_replace });
            } catch(err){
                console.log(err);
            }
        }
        onMounted(() => {
            if(containerRef.value) {
                mediaManagerRef.value.updateSelectorHeight(containerRef.value.offsetHeight - 40)
            }
        })
        // watch(() => props.caption, (newValue) => {
            
        // });
        return {
            status,
            view,
            open,
            close,
            content,
            containerRef,
            mediaManagerRef,
            mediaManagerHeight,
            openMediaEditor,
            closeMediaEditor,
            updatePreview,
            // handleFileUploaded,
            quillEditorRef,
            update,
        }
	},
};
</script>

<style>
    .mml-figure-editor-container {
        opacity: 0;
        pointer-events: none;
        transition: opacity .5s;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2000;
        width: 80%;
        max-width: 600px;
        height: 90%;
        max-height: 800px;
        background-color: #fff;
        box-shadow: 12px 12px 20px #000;
        padding-bottom: 30px;
        display: flex;
        flex-direction: column;
    }
    .mml-figure-editor-container[data-contains-buttons] {
        position: fixed;
    }
    .mml-figure-editor-container[data-status="1"] {
        opacity: 1;
        pointer-events: auto;
    }
    .mml-caption-editor-wrapper {
        flex: 0 0 120px;
    }
    /* .mml-media-editor-wrapper {
        display: none;
    } */
    /* .mml-figure-editor-container[data-view="1"] .mml-media-editor-wrapper{
        display: block;
    } */
    .mml-figure-editor-container[data-view="1"] .mml-caption-editor-wrapper,
    .mml-figure-editor-container[data-view="1"] > .buttons-container,
    .mml-figure-editor-container[data-view="1"] .mml-img-preivew-placeholder,
    .mml-figure-editor-container[data-view="1"] .mml-img-preivew{
        display: none;
    }
    .mml-img-preivew-placeholder,
    .mml-img-preivew {
        height: 200px;
        object-fit: contain;
        width: 100%;
        flex: 1;
        
    }
    .mml-img-preivew-placeholder {
        background-color: #ddd;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    /* .update-button {
        position: absolute;
        height: 30px;
        text-align: center;
        bottom: 0;
        left: 0;
        width: 100%;
    } */
    
    
    
</style>