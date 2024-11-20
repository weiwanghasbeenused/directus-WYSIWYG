<!-- export const prefix = 'mml'; -->

<template>
	<div :id="id" :class="`${prefix}media-manager-container`" :data-status="status" :data-view="view" data-contains-buttons="bottom">
        <div :class="`${prefix}media-manager-selector`" ref="selectorRef">
            <div class="selector-block pseudo-selector-block"></div>
            <div v-for="item in fetched" class="selector-block">
                <input type="radio" :name="`${id}-selected-image`" :id="item.id" @change="imageSelected" :value="item.id" :checked="item.id === img_id">
                <label :for="item.id" :name="id"><img :src="`/assets/${item.filename_disk}`" /></label>
            </div>
        </div>
        <div class="buttons-container flex-container">
            <button class="button button-confirm update-button outline" @click="confirmImage">Confirm image</button>
            <button class="button button-cancel outline" @click="close">Cancel</button>
        </div>
        <FileInput :prefix="prefix" @fileUploaded="handleFileUploaded" />
    </div>
</template>
<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import FileInput from './FileInput.vue';

export default {
	props: {
        id: {
            type: String,
            default: 'media-manager',
        },
		prefix: {
            type: String,
            default: '',
        },
        img_id: {
            type: String,
            default: '',
        },
    },
    components: {
        'FileInput': FileInput,
    },
	setup(props, {emit}) {
        let fetchStatus = 0, // 0: ready, 1: fetching, 2: fetched all
            num_fetched = 0,
            kept_img_id = '';
            
        const api_base_url = '',
              num_per_fetch = 20,
              status = ref(0),
              fetched = ref([]),
              view = ref(0);
        
        async function fetchFiles(cb){
            if(fetchStatus === 1 || fetchStatus === 2) return;
            fetchStatus = 1;
            const url = api_base_url + '/files?sort=-uploaded_on&offset=' + num_fetched + '&limit=' + num_per_fetch;
            fetch(url, { method: 'GET'})
            .then(response=> response.json())
            .then((json)=>{
                let data = json['data'];
                // console.log(data);
                
                fetched.value = fetched.value.concat(data);
                num_fetched = fetched.value.length;
                if(typeof cb === 'function') cb(data);
                if(data.length === 0) {
                    fetchStatus = 2;
                    return [];
                }
                fetchStatus = 0;
                return data;
            });
        }
        fetchFiles();
        function open(){
            updateStatus(1);
            console.log('img_id in MediaManager open():', props.img_id);
            kept_img_id = props.img_id;
            if(props.img_id) {
                const blocks = selectorRef.value.querySelectorAll('input[type="radio"]');
                for(let i = 0; i < blocks.length; i++ ){
                    if(blocks[i].value !== props.img_id) continue;
                    blocks[i].checked = true;
                }
            } else {
                const selected_block = selectorRef.value.querySelectorAll('input:checked, input.selected');
                for(let i = 0; i < selected_block.length; i++ ){
                    selected_block[i].checked = false;
                    selected_block[i].classList.remove('selected');
                }
            }
        }
        function handleFileUploaded(data){
            fetched.value = [data].concat(fetched.value);
        }
        function imageSelected(e){
            let el = e.target;
            props.img_id = el.value;
        }
        function confirmImage(){
            if(!props.img_id) return;
            updateStatus(0);
            emit('imageConfirmed', props.img_id);
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
        function updateSelectorHeight(value){
            if(selectorRef.value)
                selectorRef.value.style.height = value + 'px';
        }
        function close(){
            updateStatus(0);
            // console.log(kept_img_id.value);
            props.img_id = kept_img_id;
            emit('close');
        }
        const selectorRef = ref(null)
        const onScrollToBottom = (cb)=>{
            if(typeof cb !== 'function') return;
            const selector = selectorRef.value;
            if (selector.scrollTop + selector.clientHeight >= selector.scrollHeight - 60) {
                cb();
            }
        }
        onMounted(() => {
            if(selectorRef.value) {
                selectorRef.value.addEventListener('scroll', ()=>{ onScrollToBottom( fetchFiles ) });
            }
        })
        onUnmounted( ()=>{
            if(selectorRef.value) 
                selectorRef.value.removeEventListener('scroll', ()=>{ onScrollToBottom( fetchFiles ) });
        } )
        watch(() => props.img_id, (newValue) => {
			// if (newValue !== null) {
            //     console.log('img_id changed', newValue);
			// 	kept_img_id = newValue;
			// }
		});
        return {
            fetchFiles,
            open,
            close,
            status,
            view,
            fetched,
            handleFileUploaded,
            selectorRef,
            imageSelected,
            confirmImage,
            updateSelectorHeight
        }
	},
};
</script>

<style>
.mml-media-manager-container {
    --block-size: 50%;
    opacity: 0;
    transition: opacity .5s;
    pointer-events: none;
}
.mml-media-manager-container[data-contains-buttons] {
    position: absolute;
}
.mml-media-manager-container[data-status="1"]{
    opacity: 1;
    pointer-events: auto;
    height: 100%;
    width: 100%;
}
.mml-media-manager-selector {
    
    flex: 1;
    overflow: scroll;
    max-height: 100%;
    padding: 20px;
}
.mml-media-manager-upload-wrapper[data-status="1"] + .mml-media-manager-selector {
    display: none;
}
.selector-block {
    width: var(--block-size);
    padding: 5px;
    vertical-align: top;
    display: inline-block;
}
.selector-block.pseudo-selector-block {
    padding-bottom: var(--block-size);
}
.selector-block input[type="radio"] {
    display: none;
}
.selector-block img {
    width: 100%;
}
.selector-block label {
    border: 2px solid transparent;
    cursor: pointer;
}
.selector-block:hover label {
    opacity: 0.8;
}
.selector-block input[type="radio"]:checked + label,
.selector-block input[type="radio"].selected + label {
    border-color: #000;
}
.mml-media-manager-upload-wrapper {
    position: sticky;
    top: 0;
    background-color: #fff;
    border-bottom: 2px solid;
    flex: 0 0 80px;
}
.mml-media-manager-upload-wrapper[data-status="1"] {
    flex: 1;
}
.selected-image-wrapper {
    width: 300px;
    max-width: 100%;
}
.selected-image-wrapper img {
    width: 100%;
    height: 200px;
    object-fit: contain;
}
@media screen and (min-width: 768px) {
    .mml-media-manager-container {
        --block-size: 33.3%;
    }
}
@media screen and (min-width: 1024px) {
    .mml-media-manager-container {
        --block-size: 33.3%;
    }
}
@media screen and (min-width: 1200px) {
    .mml-media-manager-container {
        --block-size: 25%;
    }
}
</style>