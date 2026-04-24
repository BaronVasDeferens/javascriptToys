import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import kotlin.math.abs
import kotlin.system.exitProcess


enum class ZXSpectrumColor(val r: Int, val g: Int, val b: Int, val hexCode: Int) {
    BLACK(r = 0x00, g = 0x00, b = 0x00, hexCode = 0x000000),
    BLUE(r = 0x01, g = 0x00, b = 0xCE, hexCode = 0x0100CE),
    RED(r = 0xCF, g = 0x01, b = 0x00, hexCode = 0xCF0100),
    MAGENTA(r = 0xCF, g = 0x01, b = 0xCE, 0xCF01CE),
    GREEN(r = 0x00, g = 0xCF, b = 0x15, hexCode = 0x00CF15),
    CYAN(r = 0x01, g = 0xCF, b = 0xCF, hexCode = 0x01CFCF),
    YELLOW(r = 0xCF, g = 0xCF, b = 0x15, hexCode = 0xCFCF15),
    WHITE(r = 0xCF, g = 0xCF, b = 0xCF, hexCode = 0xCFCFCF),
}

fun main(args: Array<String>) {

    val source = args.getOrNull(0)
    val destination = args.getOrNull(1)

    if (source == null || destination == null) {
        printUsage()
        exitProcess(1)
    }

    val sourceFile = File(source)
    val outputFile = File(destination)


    // What are we dealing with? Single files or whole directories?
    if (sourceFile.isDirectory) {

        if (!outputFile.exists()) {
            outputFile.mkdir()
        } else if (outputFile.isFile) {
            throw Exception("Source file is directory, but destination is NOT.")
        }

        sourceFile.listFiles().orEmpty().filter { it.extension == "png" }.forEach { file ->

            println("Converting: ${file.name}...")

            val outFile = File(outputFile, file.name)
            val sourceImage = ImageIO.read(file)
            val outputImage = BufferedImage(sourceImage.width, sourceImage.height, BufferedImage.TYPE_INT_RGB)
            convertImage(sourceImage, outputImage)
            ImageIO.write(outputImage, "PNG", outFile)
        }
    } else if (sourceFile.isFile) {

        if (!outputFile.exists()) {
            outputFile.createNewFile()
            println("Created output dir :${outputFile.name}")
        }

        println("Converting: ${sourceFile.name}...")
        val sourceImage = ImageIO.read(sourceFile)
        val outputImage = BufferedImage(sourceImage.width, sourceImage.height, BufferedImage.TYPE_INT_RGB)
        convertImage(sourceImage, outputImage)
        ImageIO.write(outputImage, "PNG", outputFile)
    } else {
        throw Exception("Source and destination must BOTH be single files or BOTH be directories")
    }
}


private fun convertImage(sourceImage: BufferedImage, outputImage: BufferedImage) {

    // Walk across each pixel and map it to the closest ZXSpectrum color
    for (x in 0..<sourceImage.width) {

        for (y in 0..<sourceImage.height) {

            val pixel = sourceImage.getRGB(x, y)

            val pixelAlpha = pixel ushr 24.and(0x00FF)
            val pixelRed = pixel.ushr(16).and(0x00FF)
            val pixelGreen = pixel.ushr(8).and(0x00FF)
            val pixelBlue = pixel.ushr(0).and(0x00FF)

            val closest = ZXSpectrumColor.entries.map { zx ->
                zx to abs(pixelRed - zx.r) + abs(pixelGreen - zx.g) + abs(pixelBlue - zx.b)
            }.minBy { abs(it.second) }

            outputImage.setRGB(x, y, closest.first.hexCode)
        }
    }

}

private fun printUsage() {
    println(
        """
                SPECTRIFIER: Transform your PNGs' color palettes into ZX Spectrum's!
                USAGE:
                arg 0: source file/folder
                arg 1: destination file/folder
                If the source is a FILE, the modified file will be saved to the destination file.
                If the source is a DIRECTORY, all files therein will be converted and saved to the destination.
            """.trimIndent()
    )
}

