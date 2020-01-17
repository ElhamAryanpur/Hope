mod utils;
use web_sys::window;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn create_dom(text: &str){
    let window = window().expect("Could not get window");
    let document = window.document().expect("Could not get document");
    let body = document.body().expect("Could not get body");

    let title = document
        .create_element("h1")
        .expect("Could not create element");
    let title_text = document.create_text_node(text); // always succeeds
    title
        .append_child(&title_text)
        .expect("Could not append child to title");

    // append to body
    body.append_child(&title)
        .expect("Could not append title to body");
}

#[wasm_bindgen]
pub fn test(list: bool){
    print!("AAAAAAA");
}