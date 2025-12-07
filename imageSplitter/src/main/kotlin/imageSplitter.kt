import java.awt.Color
import java.awt.Graphics2D
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO


/**
 * ORIGINAL TILE SIZE
 * Defines the size of each (in pixels) tile in the tilemap.
 */
val originalTileSize = 64

/**
 * SCALE FACTOR
 * When re-sizing, each pixel will be rendered as a square whose sides are equal to this value.
 * For example, a scaleFactor of 5 will convert every pixel in the original image to a 5x5 pixel block.
 */
val scaleFactor = 4

val outputFileNamePrefix = "explosion"

fun main() {



    // This routine splits the specified file into individual images
    splitImage(
        imageName = "C:\\Users\\scott\\Downloads\\exp2_0.png",
        tileSize = originalTileSize,
        outputDirName = "C:\\Users\\scott\\Downloads\\exp2\\"
    )

    // Scale up all images in the specified directory by the specified amount
//    scaleImagesInDirectory(
//        sourceDirectoryName = "C:\\Users\\scott\\IdeaProjects\\javascriptToys\\imageSplitter\\output\\roguelike\\16x16",
//        scaleFactor = scaleFactor,
//        outputDirectoryName = "C:\\Users\\scott\\IdeaProjects\\javascriptToys\\imageSplitter\\output\\roguelike\\64x64"
//    )
}


fun splitImage(imageName: String, tileSize: Int, outputDirName: String) {

    val sourceImage = loadImageFile(imageName)

    val outputDir = File(outputDirName)

    if (outputDir.exists() && !outputDir.isDirectory) {
        throw RuntimeException("output dir $outputDirName is NOT a directory!")
    }

    if (!outputDir.exists()) {
        println("Creating output directory $outputDirName ...")
        outputDir.mkdirs()
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

            // Examine the image: only save it if there's content
            var blackCount = 0
            for (i in 0 until tileSize) {
                for (j in 0 until tileSize) {
                    val pixel = newImage.getRGB(i, j)
                    if (pixel == 0) {
                        blackCount++
                    }
                }
            }

            if (blackCount >= (tileSize * tileSize)) {
                println("SKIPPING TILE WRITE -- BLANK")
            } else {
                saveImage(newImage, outputDir, "${outputFileNamePrefix}_${imageCount}.png")
                imageCount++
            }
        }
    }
}

// This routine scales every .png image in the specified directory and saves a copy.
fun scaleImagesInDirectory(sourceDirectoryName: String, scaleFactor: Int, outputDirectoryName: String) {

    val sourceDirectory = File(sourceDirectoryName)
    val outputDirectory = File(outputDirectoryName)

    sourceDirectory.listFiles().orEmpty()
        .filterNotNull()
        .filter { it.isFile }
        .filter { it.name.endsWith(".png") }
        .forEach { file ->
            println("Converting ${file.name} size x${scaleFactor}...")
            val imageName = file.absolutePath
            val scaledImage = scaleImageByFactor(imageName, scaleFactor)
            saveImage(scaledImage, outputDirectory, file.name)
        }
}

fun scaleImageByFactor(imageName: String, blockSize: Int): BufferedImage {
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
    val newFile = File(outputDir, "$imageName")
    newFile.createNewFile()
    ImageIO.write(newImage, "png", newFile)
    println("Saved ${newFile.name}")
}





