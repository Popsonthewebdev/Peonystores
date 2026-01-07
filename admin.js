<script type="module">
/* ================== FIREBASE ================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5Ez5hbMCbLmybJwcpqaNPR7fTwhvT_B8",
  authDomain: "peonystores-e0710.firebaseapp.com",
  projectId: "peonystores-e0710",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "admin-auth.html";
});

/* ================== IMAGE COMPRESS ================== */
function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ================== CATEGORIES ================== */
const subcategories = {
  "Hair Care": ["Attachment","Brazilian wool","Wool attachment","Weave ons","Faux Locs","Kinky series","Baby wool","Hair cream","Hair gels/styling gels","Hair shampoo and conditioner","Hair combs","Hair oil","Hair sprays","Hair oil mask","Hair dyes","Hair styling materials","Hair beads","Hair bands/scrunchies","Hair pins/clips","Hair Rollers/ curlers","Hair care/maintenance materials","Hair spray bottle","Hair net","Hair bonnet","Edges brush","Durag","Shower caps","Mirrors"],
  "Facial & Body Care": ["facial mask","fruity facial mask","non-fruity","Eye mask","Lip mask","Mouthwash","Foot mask","lip oil","body oil and lotions","Body wash","5-in1 facial care set","Hand cream","Press on nails","Lip sticks/balms/ liner/gloss","Eye liners","Hand wash","Shaves/After shaves","Baby oil","Powders","Foot scrubber","Eyebrow razor","Nail file/cutter","face care portable bowl","Eye lash curler","Tongue scrappers","Body towels","Face towels","Soap case","Sponge"],
  "Body Scents": ["Perfumes","Body mists","Body sprays","Perfume oil","Atomizer","Air fresheners"],
  "Wears": ["Body towels","Face towels","Face caps","Scarfs","Bandanas","Jersey shorts","Socks","Bags","Male 3-in-1 designer briefs","Male condom boxers","Male cotton boxers","Male cotton shorts","Male cotton T-Shirts / vests / polos","Male quality up and down","Female corporate gowns","Female tops","Female skirts"],
  "Food Corner": ["Chinchin","Cakes","Groundnuts","Bottled water","Soda","Wines","Fruit juice","Flour","Preservatives","Flavor","Milk flavor","Asun plates","Wine cups","Cookie cutter","Icing sugar","Icing nozzles","Margarine","Baking powder","Yeast","Sugar","Cupcake containers","Foil containers","Fruit punch flavor"],
  "Others": ["Shoe polish/cream","Rechargeable hand fan","Welcome carpet","Sanitary towels","Mannequin"]
};

/* ================== DOM REFERENCES ================== */
let categorySelect, subcategorySelect, addForm;

/* ================== SUBCATEGORY POPULATOR ================== */
function populateSubcategories(category, selected = "") {
  subcategorySelect.innerHTML = `<option value="">Select Subcategory</option>`;
  if (!subcategories[category]) return;

  subcategories[category].forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = sub;
    if (sub === selected) opt.selected = true;
    subcategorySelect.appendChild(opt);
  });
}

/* ================== DOM READY ================== */
document.addEventListener("DOMContentLoaded", () => {
  categorySelect = document.getElementById("categorySelect");
  subcategorySelect = document.getElementById("subcategorySelect");
  addForm = document.getElementById("addProductForm");

  categorySelect.addEventListener("change", () => {
    populateSubcategories(categorySelect.value.trim());
  });

  addForm.addEventListener("submit", handleProductSubmit);

  renderProductsTable();
  renderOrders();
  setupExcelFilters();
});

/* ================== PRODUCT SUBMIT ================== */
async function handleProductSubmit(e) {
  e.preventDefault();

  if (!categorySelect.value || !subcategorySelect.value) {
    alert("Please select category and subcategory");
    return;
  }

  const editingIndex = editingIndexInput.value;
  const file = imageFileInput.files[0];
  const url = imageURLInput.value.trim();

  const save = async image => {
    const data = {
      name: productName.value.trim(),
      description: descriptionInput.value.trim(),
      category: categorySelect.value.trim(),
      subcategory: subcategorySelect.value.trim(),
      categorySlug: categorySelect.value.toLowerCase().replace(/\s+/g, "-"),
      subcategorySlug: subcategorySelect.value.toLowerCase().replace(/\s+/g, "-"),
      colors: colorsInput.value.split(",").map(v => v.trim()).filter(Boolean),
      sizes: sizesInput.value.split(",").map(v => v.trim()).filter(Boolean),
      price: Number(priceInput.value),
      stock: Number(stockInput.value),
      image: image || ""
    };

    editingIndex
      ? await updateDoc(doc(db, "products", editingIndex), data)
      : await addDoc(collection(db, "products"), data);

    addForm.reset();
    renderProductsTable();
  };

  if (file) save(await compressImage(file));
  else save(url);
}

/* ================== EDIT PRODUCT ================== */
async function editProduct(id) {
  const snap = await getDoc(doc(db, "products", id));
  const p = snap.data();

  productName.value = p.name;
  descriptionInput.value = p.description || "";
  categorySelect.value = p.category;
  populateSubcategories(p.category, p.subcategory);
  colorsInput.value = (p.colors || []).join(", ");
  sizesInput.value = (p.sizes || []).join(", ");
  priceInput.value = p.price;
  stockInput.value = p.stock;
  imageURLInput.value = p.image || "";
  editingIndexInput.value = id;
}

/* ================== GLOBAL EXPORTS ================== */
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.downloadCSV = downloadCSV;
window.resetAllFilters = resetAllFilters;
</script>
