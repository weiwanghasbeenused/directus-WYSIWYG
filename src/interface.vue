<template>
	<QuillEditor v-model:content="content" :options="editorOptions" ref="quillEditorRef" :data-view="view" contentType="html" @textChange="update" />
	<FigureEditor :prefix="prefix" ref="figureEditorRef" :img_id="figureEditorImgId" :caption="figureEditorCaption" :insert_position="figureInsertPosition" :figure_to_replace="figureEditorFigureToReplace" @update="insertImageWithCaption" @close="resetFigureEditorVariables"></FigureEditor>
</template>

<script>
import { ref, watch, onMounted, nextTick } from 'vue';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { QuillEditor, Quill } from '@vueup/vue-quill';
import FigureBlot from './quill-blots/FigureBlot.js';
import FigureEditor from './FigureEditor.vue';
import './main.css';
// console.log('script');
// try {
// 	console.log(import.meta.env.VUE_APP_DIRECTUS_URL);
// } catch{
// 	console.log('fail to read import.meta.env.VUE_APP_DIRECTUS_URL')
// }
// try {
// 	console.log(process.env.VUE_APP_DIRECTUS_URL);
// } catch{
// 	console.log('fail to read process.env.VUE_APP_DIRECTUS_URL')
// }

// Props
export default {
	props: {
		value: {
			type: String,
			default: '',
		},
	},
	components: {
		'QuillEditor': QuillEditor,
		'FigureEditor': FigureEditor
	},
	emits: ['input'],
	setup(props, {emit}) {
		const prefix = 'mml-';
		const figureEditorRef = ref(null);
		const quillEditorRef = ref(null);
		const content = ref(props.value || '');
		const figureEditorImgId = ref('');
		const figureEditorCaption = ref('');
		const figureInsertPosition = ref(0);
		const figureEditorFigureToReplace = ref(null);
		const api_base_url = '';
		
		const editorOptions = {
			modules: {
				toolbar: {
					'container': [[{ header: [1, 2, false] }], ['bold', 'italic', { 'list': 'ordered'}, { 'list': 'bullet'}], ['link', 'image', 'video'], ['code-block']],
					'handlers': {
						'image': function (value){
							document.dispatchEvent(new CustomEvent('init-figure-editor', {'detail': null}));
						}
					}
				},
				clipboard: {
					matchVisual: false, // Prevents Quill from modifying the HTML
				},
			},
			theme: 'snow'
		}
		function insertImageWithCaption({img_id, caption, insert_position, figure_to_replace}) {
			if (img_id) {
				if(figure_to_replace !== null) {
					const quill = getQuillInstance();
					quill.deleteText(figure_to_replace, 1);
				}
				// console.log(caption);
				// caption = caption.replaceAll(/<\/p><p>/g, '<br /><br />');
				// console.log(caption);
				// caption = caption.replaceAll(/(:?<p>|<\/p>)/g, '');
				// console.log(caption);
				const figureHtml = `
					<div class="custom-figure-wrapper">
						<figure class="custom-figure">
							<div class="image-wrapper figure-image-wrapper">
								<img class="figure-image" src="/assets/${img_id}" alt="Image" />
							</div>
							<figcaption class="custom-figure-caption ${caption ? '' : 'empty'}">${caption}</figcaption>
						</figure>
					</div>
				`;
				/* 
					once quill senses that a div.custom-figure-wrapper is added, it use the registered custom blot. 
					the custom blot has defined what its node looks like:
					  FigureBlot.tagName = 'div';
					  FigureBlot.className = 'custom-figure-wrapper';
				*/
				insertHtml(figureHtml, insert_position);
				figureEditorRef.value.close();
			}
		}
		
		function insertHtml(html, index = null) {
			const quill = getQuillInstance();
			if(index === null) {
				const range = quill.getSelection();
				if (range) {
					index = range.index;
				} else {
					alert('Cannot find index in insertHtml()');
					return;
				}
			}
			quill.clipboard.dangerouslyPasteHTML(index, html);
		}
		function openEditingInterface(detail) {
			const quill = getQuillInstance();
			let index = false;
			if(detail) {
				figureEditorImgId.value = detail.imgId;
				figureEditorCaption.value = detail.caption;   
				if(detail.figure) {
					const blot = Quill.find(detail.figure);
					if(blot) {
						const figureIndex = quill.getIndex(blot);  // Get the index using the blot
						figureEditorFigureToReplace.value = figureIndex;
						index = figureIndex;
					}
				}
			} else {
				resetFigureEditorVariables();
			}
			if(index === false) {
				const range = quill ? quill.getSelection() : null;
				if(!range) console.error('index is not defined in openEditingInterface');
				index = range.index;
			}
			
			figureInsertPosition.value = index;
			
			nextTick(()=>{
				figureEditorRef.value.open();
			});
			
		}
		function getQuillInstance() {
			return quillEditorRef.value.getQuill();
		}
		function resetFigureEditorVariables(){
			figureEditorImgId.value = '';
			figureEditorCaption.value = '';
			figureInsertPosition.value = 0;
			figureEditorFigureToReplace.value = null;
		}
		function update(data){
			emit('input', content.value);
		}
		onMounted(() => {
			document.addEventListener('init-figure-editor', (event) => {				
				openEditingInterface(event.detail);
			});
		});
		watch(() => props.value, (newValue) => {
			if (newValue !== null) {
				content.value = newValue;
			}
		});
		return {
			prefix,
			figureEditorRef,
			content,
			quillEditorRef,
			insertImageWithCaption,
			editorOptions,
			figureEditorImgId,
			figureEditorCaption,
			figureInsertPosition,
			figureEditorFigureToReplace,
			resetFigureEditorVariables,
			update
		}
	}
}
</script>

<style scoped>
.image-caption-container {
margin-top: 20px;
}
</style>