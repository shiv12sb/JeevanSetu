try {
  $pptApp = New-Object -ComObject PowerPoint.Application
  Write-Host "PowerPoint COM object available!"
  $pptxPath = "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\JeevanSetu_SIH_Final_Presentation.pptx"
  $presentation = $pptApp.Presentations.Open($pptxPath, 2, 0, 0)
  
  $pdfPath = "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\JeevanSetu_SIH_Final_Presentation.pdf"
  $presentation.SaveAs($pdfPath, 32)
  Write-Host "Exported PDF successfully to $pdfPath"
  
  $exportDir = "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\assets\slide_exports"
  if (-not (Test-Path $exportDir)) {
    New-Item -ItemType Directory -Force -Path $exportDir | Out-Null
  }
  
  for ($idx = 1; $idx -le $presentation.Slides.Count; $idx++) {
    $slideImgPath = "$exportDir\slide_$idx.png"
    $presentation.Slides.Item($idx).Export($slideImgPath, "PNG", 1920, 1080)
    Write-Host "Exported Slide $idx to $slideImgPath"
  }
  
  $presentation.Close()
  $pptApp.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null
  Write-Host "All slides exported successfully!"
} catch {
  Write-Host "COM automation error: $($_.Exception.Message)"
}
