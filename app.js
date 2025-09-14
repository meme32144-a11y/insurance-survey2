/** * Thai Insurance Survey Application JavaScript 
 * แอปพลิเคชันแบบสอบถามประกันภัยภาษาไทย 
 */

// ==== เพิ่มส่วนเชื่อม Google Apps Script ====
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHXr-EMUOo2AzUaYHJxzEQKz6YMvB_VwE72Q05FapQh17bi4xkCiK7Vy_jXpVGZB22lA/exec';

// แปลงข้อมูลสำหรับส่ง (Array -> comma-separated)
function buildPayload(data) {
  const normalized = {};
  Object.keys(data).forEach(k => {
    const v = data[k];
    normalized[k] = Array.isArray(v) ? v.join(', ') : v;
  });
  normalized._submittedAt = new Date().toISOString();
  normalized._userAgent = navigator.userAgent;
  return normalized;
}

// ฟังก์ชันส่งข้อมูลไป Apps Script
async function submitSurvey() {
  try {
    const payload = buildPayload(formData);
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    alert('บันทึกข้อมูลเรียบร้อย ขอบคุณที่ตอบแบบสอบถาม!');
    // สามารถ redirect หรือกดปิดหน้าต่างได้ตรงนี้
  } catch (err) {
    alert('ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่ หรือแจ้งผู้ดูแลระบบ');
  }
}

// Global variables
let currentSection = 0; 
let formData = {}; 
const totalSections = 6; 
console.log('Loading survey application...'); 

/** * เริ่มต้นการทำแบบสอบถาม */ 
function startSurvey() { 
  console.log('startSurvey function called'); 
  try { 
    // ซ่อนหน้าแนะนำ 
    const introduction = document.getElementById('introduction'); 
    if (introduction) { 
      introduction.style.display = 'none'; 
      console.log('Introduction hidden'); 
    } 
    // แสดงแบบฟอร์ม 
    const surveyForm = document.getElementById('surveyForm'); 
    if (surveyForm) { 
      surveyForm.classList.remove('d-none'); 
      console.log('Survey form shown'); 
    } 
    // แสดงปุ่มนำทาง 
    const navigation = document.getElementById('navigation'); 
    if (navigation) { 
      navigation.classList.remove('d-none'); 
      console.log('Navigation shown'); 
    } 
    // เริ่มที่ส่วนแรก 
    currentSection = 1; 
    showSection(1); 
    updateProgress(); 
    console.log('Survey started successfully'); 
  } catch (error) { 
    console.error('Error starting survey:', error); 
    alert('เกิดข้อผิดพลาดในการเริ่มแบบสอบถาม กรุณาลองใหม่'); 
  } 
} 

/** * แสดงส่วนที่กำหนด */ 
function showSection(sectionNumber) { 
  console.log(`Showing section ${sectionNumber}`); 
  // ซ่อนทุกส่วน 
  for (let i = 1; i <= totalSections; i++) { 
    const section = document.getElementById(`section-${i}`); 
    if (section) { 
      section.classList.add('d-none'); 
    } 
  } 
  // แสดงส่วนที่ต้องการ 
  const targetSection = document.getElementById(`section-${sectionNumber}`); 
  if (targetSection) { 
    targetSection.classList.remove('d-none'); 
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
  } 
  updateNavigationButtons(); 
} 

/** * ไปส่วนถัดไป */ 
function nextSection() { 
  console.log(`Next section from ${currentSection}`); 
  if (validateSection(currentSection)) { 
    saveData(currentSection); 
    if (currentSection < totalSections) { 
      currentSection++; 
      showSection(currentSection); 
      updateProgress(); 
    } else { 
      showSummary(); 
    } 
  } 
} 

/** * กลับส่วนก่อนหน้า */ 
function previousSection() { 
  console.log(`Previous section from ${currentSection}`); 
  if (currentSection > 1) { 
    currentSection--; 
    showSection(currentSection); 
    updateProgress(); 
  } 
} 

/** * ตรวจสอบความถูกต้องของส่วนปัจจุบัน */ 
function validateSection(sectionNumber) { 
  const section = document.getElementById(`section-${sectionNumber}`); 
  if (!section) return true; 
  // ล้าง error messages เก่า 
  section.querySelectorAll('.invalid-feedback').forEach(el => el.remove()); 
  section.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid')); 
  const requiredInputs = section.querySelectorAll('input[required], textarea[required]'); 
  let isValid = true; 
  // ตรวจสอบ radio groups 
  const radioGroups = {}; 
  requiredInputs.forEach(input => { 
    if (input.type === 'radio') { 
      if (!radioGroups[input.name]) { 
        radioGroups[input.name] = section.querySelectorAll(`input[name="${input.name}"]`); 
      } 
    } 
  }); 
  // ตรวจสอบแต่ละ radio group 
  Object.keys(radioGroups).forEach(groupName => { 
    const radios = radioGroups[groupName]; 
    const isChecked = Array.from(radios).some(radio => radio.checked); 
    if (!isChecked) { 
      isValid = false; 
      const firstRadio = radios[0]; 
      const container = firstRadio.closest('.question-group'); 
      if (container) { 
        const feedback = document.createElement('div'); 
        feedback.className = 'invalid-feedback d-block'; 
        feedback.textContent = 'กรุณาเลือกคำตอบ'; 
        container.appendChild(feedback); 
      } 
    } 
  }); 
  // ตรวจสอบ checkbox groups ที่ required 
  const checkboxGroups = {}; 
  section.querySelectorAll('input[type="checkbox"]').forEach(checkbox => { 
    const container = checkbox.closest('.question-group'); 
    if (container && container.querySelector('.form-label.required')) { 
      if (!checkboxGroups[checkbox.name]) { 
        checkboxGroups[checkbox.name] = section.querySelectorAll(`input[name="${checkbox.name}"]`); 
      } 
    } 
  }); 
  Object.keys(checkboxGroups).forEach(groupName => { 
    const checkboxes = checkboxGroups[groupName]; 
    const isChecked = Array.from(checkboxes).some(cb => cb.checked); 
    if (!isChecked) { 
      isValid = false; 
      const firstCheckbox = checkboxes[0]; 
      const container = firstCheckbox.closest('.question-group'); 
      if (container) { 
        const feedback = document.createElement('div'); 
        feedback.className = 'invalid-feedback d-block'; 
        feedback.textContent = 'กรุณาเลือกอย่างน้อย 1 ข้อ'; 
        container.appendChild(feedback); 
      } 
    } 
  }); 
  // ตรวจสอบ textarea และ input อื่นๆ 
  requiredInputs.forEach(input => { 
    if (input.type !== 'radio' && input.type !== 'checkbox') { 
      if (!input.value.trim()) { 
        isValid = false; 
        input.classList.add('is-invalid'); 
        const feedback = document.createElement('div'); 
        feedback.className = 'invalid-feedback'; 
        feedback.textContent = 'กรุณากรอกข้อมูล'; 
        input.parentNode.appendChild(feedback); 
      } 
    } 
  }); 
  return isValid; 
} 

/** * บันทึกข้อมูลของส่วนปัจจุบัน */ 
function saveData(sectionNumber) { 
  const section = document.getElementById(`section-${sectionNumber}`); 
  if (!section) return; 
  const inputs = section.querySelectorAll('input, textarea, select'); 
  inputs.forEach(input => { 
    if (input.type === 'radio' && input.checked) { 
      formData[input.name] = input.value; 
    } else if (input.type === 'checkbox' && input.checked) { 
      if (!formData[input.name]) formData[input.name] = []; 
      if (!formData[input.name].includes(input.value)) { 
        formData[input.name].push(input.value); 
      } 
    } else if (input.type !== 'radio' && input.type !== 'checkbox' && input.value.trim()) { 
      formData[input.name] = input.value; 
    } 
  }); 
  console.log('Data saved:', formData); 
} 

/** * อัปเดตความคืบหน้า */ 
function updateProgress() { 
  const progressBar = document.querySelector('.progress-bar'); 
  const progressText = document.querySelector('.progress-text'); 
  if (progressBar && progressText) { 
    const percentage = (currentSection / totalSections) * 100; 
    progressBar.style.width = `${percentage}%`; 
    progressText.textContent = `ขั้นตอนที่ ${currentSection} จาก ${totalSections}`; 
  } 
} 

/** * อัปเดตปุ่มนำทาง */ 
function updateNavigationButtons() { 
  const prevBtn = document.getElementById('prevBtn'); 
  const nextBtn = document.getElementById('nextBtn'); 
  if (prevBtn) { 
    prevBtn.disabled = currentSection <= 1; 
  } 
  if (nextBtn) { 
    if (currentSection >= totalSections) { 
      nextBtn.innerHTML = 'ตรวจสอบข้อมูล'; 
    } else { 
      nextBtn.innerHTML = 'ถัดไป'; 
    } 
  } 
} 

/** * แสดงหน้าสรุป */ 
function showSummary() { 
  console.log('Showing summary'); 
  document.getElementById('surveyForm').classList.add('d-none'); 
  document.getElementById('navigation').classList.add('d-none'); 
  const summarySection = document.getElementById('summary-section'); 
  summarySection.classList.remove('d-none'); 
  generateSummary(); 
  const progressBar = document.querySelector('.progress-bar'); 
  const progressText = document.querySelector('.progress-text'); 
  if (progressBar) progressBar.style.width = '100%'; 
  if (progressText) progressText.textContent = 'สรุปข้อมูล'; 

  // === เพิ่มการผูกปุ่ม "ส่งข้อมูล" ===
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) submitBtn.onclick = submitSurvey;
}

/** * สร้างเนื้อหาสรุป */ 
function generateSummary() { 
  const summaryContent = document.getElementById('summary-content'); 
  let html = '<ul>'; 
  if (formData.age) html += `<li>อายุ: ${formData.age}</li>`; 
  if (formData.gender) html += `<li>เพศ: ${formData.gender}</li>`; 
  if (formData.status) html += `<li>สถานภาพ: ${formData.status}</li>`; 
  // ใส่ข้อมูลอื่นๆ ที่ต้องการสรุป 
  if (formData.life_gaps_description) html += `<li>${formData.life_gaps_description}</li>`; 
  html += '</ul>'; 
  summaryContent.innerHTML = html; 
}