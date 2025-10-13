import java.awt.Color
import java.awt.Graphics2D
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO

fun main() {

    val sourceImageName =
        "C:\\Users\\scott\\IdeaProjects\\javascriptToys\\wizard_wars\\resources\\tiles\\ProjectUtumno_full.png"
    val sourceDirectoryName = "C:\\Users\\scott\\IdeaProjects\\javascriptToys\\wizard_wars\\resources\\tiles\\32x32"
    val outputDirectoryName = "C:\\Users\\scott\\IdeaProjects\\javascriptToys\\wizard_wars\\resources\\tiles\\64x64"

//    splitImage(sourceImageName, 32, outputDirectoryName)


    val scaleFactor = 2
    val outputDirectory = File(outputDirectoryName)

    File(sourceDirectoryName).listFiles()
        .filterNotNull()
        .filter { it.isFile }
        .filter { it.name.endsWith(".png") }
        .forEach { file ->
            println("Converting ${file.name} size x${scaleFactor}...")
            val imageName = file.absolutePath
            val scaledImage = scaleImage(imageName, scaleFactor)
            saveImage(scaledImage, outputDirectory, file.name)
        }

}


fun splitImage(imageName: String, tileSize: Int, outputDirName: String) {

    val sourceImage = loadImageFile(imageName)
    if (sourceImage.width % tileSize != 0
        || sourceImage.height % tileSize != 0
    ) {
        throw RuntimeException("source image not evenly divisible by $tileSize")
    }

    val outputDir = File(outputDirName)
    if (outputDir.exists() && !outputDir.isDirectory) {
        throw RuntimeException("output dir $outputDirName is NOT a directory!")
    }
    if (!outputDir.exists()) {
        println("Creating output directory $outputDirName ...")
        outputDir.mkdir()
    }

    var imageCount = 0
    // Go row by row
    for (y in 0 until sourceImage.height / tileSize) {
        for (x in 0 until sourceImage.width / tileSize) {
            val newImage = BufferedImage(tileSize, tileSize, BufferedImage.TYPE_INT_ARGB)
            val graphics = newImage.graphics as Graphics2D
            graphics.drawImage(
                sourceImage.getSubimage(x * tileSize, y * tileSize, tileSize, tileSize),
                0,
                0,
                null
            )
            graphics.dispose()
            saveImage(newImage, outputDir, "tile_${imageCount}")
            imageCount++
        }
    }
}


fun scaleImage(imageName: String, blockSize: Int): BufferedImage {
    val image = loadImageFile(imageName)
    // sanity check: input image size
    if (image.width != image.height) {
        throw RuntimeException("${image.width} x ${image.height} input image is not square!")
    } else {
        println("${image.width} x ${image.height} input image size OK!")
    }

    return convertToScaledImage(image, blockSize)

}

fun loadImageFile(fileName: String): BufferedImage {
    return ImageIO.read(File(fileName))
}

fun convertToScaledImage(sourceImage: BufferedImage, targetSize: Int): BufferedImage {
    println("Creating new image ${sourceImage.width * targetSize} x ${sourceImage.height * targetSize}")
    val newImage =
        BufferedImage(
            sourceImage.width * targetSize,
            sourceImage.height * targetSize,
            BufferedImage.TYPE_INT_ARGB
        )
    val graphics = newImage.graphics as Graphics2D

    for (x in 0..<sourceImage.width) {
        for (y in 0..<sourceImage.height) {
            val colorAsRGBa = Color(sourceImage.getRGB(x, y), true)
            graphics.color = colorAsRGBa
            graphics.fillRect(x * targetSize, y * targetSize, targetSize, targetSize)
        }
    }
    return newImage
}

fun saveImage(newImage: BufferedImage, outputDir: File, imageName: String) {
    val newFile = File(outputDir, imageName)
    newFile.createNewFile()
    ImageIO.write(newImage, "png", newFile)
    println("Saved ${newFile.name}")
}