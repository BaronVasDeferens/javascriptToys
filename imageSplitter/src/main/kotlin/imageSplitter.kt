import java.awt.Color
import java.awt.Graphics2D
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO


fun main(args: Array<String>) {

    var inputImageFileName: String
    var inputFile: File

    var tileSize: Int = 0
    var scaleFactor: Int = 1

    var outputDirName: String
    var outputDir: File


    // Parse arguments
    try {

        inputImageFileName = args[0]

        if (!inputImageFileName.endsWith(".png")) {
            throw Exception("Only PNG files are supported")
        }

        inputFile = File(inputImageFileName)
        if (!inputFile.exists()) {
            throw Exception("Input file (arg 0) $inputImageFileName does not exist!")
        }

        tileSize = args[1].toInt()

        scaleFactor = args[2].toInt()

        outputDirName = args[3]
        outputDir = File(outputDirName)
        if (!outputDir.exists()) {
            throw Exception("Output directory (arg 2) does not exist!")
        }

        println("""
            
            inputImage: ${inputFile.absolutePath}
            tileSize: $tileSize
            scaleFactor: $scaleFactor
            outputDir: ${outputDir.absolutePath}
            
        """.trimIndent())

        // This routine splits the specified file into individual images
        splitImage(
            inputFile = inputFile,
            tileSize = tileSize,
            scaleFactor = scaleFactor,
            outputDir = outputDir
        )

    } catch (e: Exception) {
        println("ERROR: $e")
        println(
            """
            *** Image Splitter Usage ***
            arg 0: input image file to split
            arg 1: size of images (in pixels)
            arg 2: scale factor
            arg 3: output directory
        """.trimIndent()
        )
    }
}


fun splitImage(inputFile: File, tileSize: Int, scaleFactor: Int, outputDir: File) {

    val sourceImage: BufferedImage = ImageIO.read(inputFile)

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
                val scaledImage = scaleImage(newImage, scaleFactor)
                saveImage(scaledImage, outputDir, "${imageCount}.png")
                imageCount++
            }
        }
    }
}


fun scaleImage(sourceImage: BufferedImage, scaleFactor: Int): BufferedImage {
    val newImage =
        BufferedImage(
            sourceImage.width * scaleFactor,
            sourceImage.height * scaleFactor,
            BufferedImage.TYPE_INT_ARGB
        )
    val graphics = newImage.graphics as Graphics2D

    for (x in 0..< sourceImage.width) {
        for (y in 0..< sourceImage.height) {
            val colorAsRGBa = Color(sourceImage.getRGB(x, y), true)
            graphics.color = colorAsRGBa
            graphics.fillRect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor)
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